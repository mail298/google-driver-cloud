import type { Request } from 'express'

export type DetectedAttack = {
  type: string
  detail: string
  pattern: string
  autoBan: boolean
}

/**
 * Common attack probe patterns to protect Drive9 against automated exploit scanners.
 */
const ATTACK_PATTERNS: Array<{
  type: string
  pattern: RegExp
  target: 'path' | 'query' | 'all'
  autoBan: boolean
}> = [
  // 1. WordPress / CMS Vulnerability Probes (No WP exists on Drive9 — instant auto-ban)
  {
    type: 'WordPress / CMS Exploit Probe',
    pattern: /(\/|\b)(wp-admin|wp-login|wp-config|wp-json|xmlrpc|wp-content|wp-includes|blog\/wp-|wordpress|wp-cron)(\.php|\/|\?|$)/i,
    target: 'path',
    autoBan: true
  },
  // 2. Sensitive Files & Secret Leak Probes (Instant auto-ban)
  {
    type: 'Sensitive File Discovery Probe',
    pattern: /(\/|\b)(\.env|\.git|\.aws|id_rsa|id_dsa|authorized_keys|web\.config|backup\.sql|dump\.sql|config\.json|database\.sqlite|docker-compose\.yml)(\.|\/|\?|$)/i,
    target: 'path',
    autoBan: true
  },
  // 3. Database & Web Admin Tool Scanners (Instant auto-ban)
  {
    type: 'Database Admin Tool Probe',
    pattern: /(\/|\b)(phpmyadmin|pma|adminer|mysqladmin|dbadmin|myadmin|setup\.php|install\.php)(\/|\?|$)/i,
    target: 'path',
    autoBan: true
  },
  // 4. Remote Code Execution & Web Shell Probes (Instant auto-ban)
  {
    type: 'Webshell / RCE Probe',
    pattern: /(\/|\b)(cgi-bin\/|eval-stdin|alfa\.php|c99\.php|r57\.php|shell\.php|cmd\.php|wso\.php|solr|actuator|telescope)(\/|\?|$)/i,
    target: 'path',
    autoBan: true
  },
  // 5. Log4j / JNDI Exploit Probe (Instant auto-ban)
  {
    type: 'JNDI / Log4Shell Exploit',
    pattern: /\$\{jndi:(ldap|rmi|dns|nis|iiop):/i,
    target: 'all',
    autoBan: true
  },
  // 6. Directory / Path Traversal
  {
    type: 'Directory Traversal Attempt',
    pattern: /(\.\.[\/\\]|%2e%2e%2f|%2e%2e\/|\.\.;\/)/i,
    target: 'all',
    autoBan: true
  },
  // 7. Generic SQL Injection in URL / Non-Search Queries
  {
    type: 'SQL Injection Attempt',
    pattern: /(\b(union(\s+all)?\s+select|information_schema|benchmark\s*\(\d+,\s*md5|sleep\s*\(\d+\))\b|'\s*or\s*['\d]+=['\d]+|;\s*drop\s+table)/i,
    target: 'all',
    autoBan: false
  }
]

/**
 * Inspects a request path, query string, and headers for known attack patterns.
 * - Uses pure path (without query parameters) for path targets to prevent false-positives
 *   on legitimate file search queries like GET /files?q=config.json.
 * Returns information on the attack if detected, or null if legitimate.
 */
export function detectAttackPattern(req: Request): DetectedAttack | null {
  // Extract path ONLY (excluding query string)
  const purePath = req.path || (req.url ? req.url.split('?')[0] : '')
  const decodedPath = (() => {
    try {
      return decodeURIComponent(purePath)
    } catch {
      return purePath
    }
  })()

  const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?') + 1) : ''
  const decodedQuery = (() => {
    try {
      return decodeURIComponent(queryString)
    } catch {
      return queryString
    }
  })()

  // Skip query string SQL inspection on authenticated file search endpoints
  // where Prisma uses parameterized queries and users might legitimately search words
  const isFileSearchEndpoint = purePath.startsWith('/files') || purePath.startsWith('/folders')

  for (const rule of ATTACK_PATTERNS) {
    if (rule.target === 'path') {
      if (rule.pattern.test(purePath) || rule.pattern.test(decodedPath)) {
        return {
          type: rule.type,
          detail: purePath,
          pattern: rule.pattern.toString(),
          autoBan: rule.autoBan
        }
      }
    } else if (rule.target === 'query') {
      if (!isFileSearchEndpoint && queryString && (rule.pattern.test(queryString) || rule.pattern.test(decodedQuery))) {
        return {
          type: rule.type,
          detail: `Query: ${queryString}`,
          pattern: rule.pattern.toString(),
          autoBan: rule.autoBan
        }
      }
    } else if (rule.target === 'all') {
      const matchPath = rule.pattern.test(purePath) || rule.pattern.test(decodedPath)
      const matchQuery = !isFileSearchEndpoint && queryString && (rule.pattern.test(queryString) || rule.pattern.test(decodedQuery))

      if (matchPath || matchQuery) {
        return {
          type: rule.type,
          detail: matchPath ? purePath : `Query: ${queryString}`,
          pattern: rule.pattern.toString(),
          autoBan: rule.autoBan
        }
      }
    }
  }

  return null
}

