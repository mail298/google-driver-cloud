import type { Request } from 'express'

export type DetectedAttack = {
  type: string
  detail: string
  pattern: string
}

/**
 * Common attack probe patterns to protect Drive9 against automated exploit scanners.
 */
const ATTACK_PATTERNS: Array<{
  type: string
  pattern: RegExp
  target: 'path' | 'query' | 'all'
}> = [
  // 1. WordPress / CMS Vulnerability Probes
  {
    type: 'WordPress / CMS Exploit Probe',
    pattern: /(\/|\b)(wp-admin|wp-login|wp-json|xmlrpc\.php|wp-content|wp-includes|blog\/wp-|wordpress|wp-cron)(\/|\?|$)/i,
    target: 'path'
  },
  // 2. Sensitive Files & Secret Leak Probes
  {
    type: 'Sensitive File Discovery Probe',
    pattern: /(\/|\b)(\.env|\.git|\.aws|id_rsa|id_dsa|authorized_keys|web\.config|backup\.sql|dump\.sql|config\.json|database\.sqlite|docker-compose\.yml)(\/|\?|$)/i,
    target: 'path'
  },
  // 3. Database & Web Admin Tool Scanners
  {
    type: 'Database Admin Tool Probe',
    pattern: /(\/|\b)(phpmyadmin|pma|adminer|mysqladmin|dbadmin|myadmin|setup\.php|install\.php)(\/|\?|$)/i,
    target: 'path'
  },
  // 4. Remote Code Execution & Web Shell Probes
  {
    type: 'Webshell / RCE Probe',
    pattern: /(\/|\b)(cgi-bin\/|eval-stdin|alfa\.php|c99\.php|r57\.php|shell\.php|cmd\.php|wso\.php|solr|actuator|telescope)(\/|\?|$)/i,
    target: 'path'
  },
  // 5. Log4j / JNDI Exploit Probe
  {
    type: 'JNDI / Log4Shell Exploit',
    pattern: /\$\{jndi:(ldap|rmi|dns|nis|iiop):/i,
    target: 'all'
  },
  // 6. Directory / Path Traversal
  {
    type: 'Directory Traversal Attempt',
    pattern: /(\.\.[\/\\]|%2e%2e%2f|%2e%2e\/|\.\.;\/)/i,
    target: 'all'
  },
  // 7. Generic SQL Injection in URL / Query
  {
    type: 'SQL Injection Attempt',
    pattern: /(\b(union(\s+all)?\s+select|select\s+.*\s+from|insert\s+into|information_schema|benchmark\s*\(|sleep\s*\()\b|'\s*or\s*['\d]+=['\d]+|'\s*--)/i,
    target: 'all'
  }
]

/**
 * Inspects a request path, query string, and headers for known attack patterns.
 * Returns information on the attack if detected, or null if legitimate.
 */
export function detectAttackPattern(req: Request): DetectedAttack | null {
  const originalUrl = req.originalUrl || req.url || ''
  const decodedPath = (() => {
    try {
      return decodeURIComponent(originalUrl)
    } catch {
      return originalUrl
    }
  })()

  const queryString = req.url.includes('?') ? req.url.split('?')[1] : ''

  for (const rule of ATTACK_PATTERNS) {
    if (rule.target === 'path') {
      if (rule.pattern.test(originalUrl) || rule.pattern.test(decodedPath)) {
        return {
          type: rule.type,
          detail: originalUrl,
          pattern: rule.pattern.toString()
        }
      }
    } else if (rule.target === 'query') {
      if (queryString && rule.pattern.test(queryString)) {
        return {
          type: rule.type,
          detail: `Query: ${queryString}`,
          pattern: rule.pattern.toString()
        }
      }
    } else if (rule.target === 'all') {
      if (
        rule.pattern.test(originalUrl) ||
        rule.pattern.test(decodedPath) ||
        (queryString && rule.pattern.test(queryString))
      ) {
        return {
          type: rule.type,
          detail: originalUrl,
          pattern: rule.pattern.toString()
        }
      }
    }
  }

  return null
}
