<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Core\CdnHelper.php

class CdnHelper
{
    /**
     * Default CDN sharding hosts (img1..imgN.wn-cdn.net).
     * Overridable via env: CDN_HOSTS=img1.wn-cdn.net,img2.wn-cdn.net,...
     */
    private static function hosts()
    {
        $raw = Config::get('CDN_HOSTS', '');
        if (!empty(trim($raw))) {
            $list = array_values(array_filter(array_map('trim', explode(',', $raw))));
            if (count($list) > 0) {
                return $list;
            }
        }
        return ['img1.wn-cdn.net', 'img2.wn-cdn.net', 'img3.wn-cdn.net', 'img4.wn-cdn.net'];
    }

    /**
     * Deterministically pick a CDN host for a given file ID.
     * Same file -> same host, so caching/ETag stays consistent.
     */
    public static function hostFor($fileId)
    {
        $hosts = self::hosts();
        $idx = abs(crc32((string) $fileId)) % count($hosts);
        return $hosts[$idx];
    }

    /**
     * Build an absolute CDN URL for a file resource.
     *
     * Options:
     *   thumb   : ?thumb=1  (10-15KB image preview)
     *   inline  : ?inline=1 (inline full-size)
     *   raw     : ?raw=1    (force raw download)
     *   path    : share|download|embed|stream  (default download)
     *   version : updated_at file — dipakai sbg ?v=hash; saat file diganti
     *             (updated_at berubah), URL berubah → cache CDN lama ter-bypass
     *   extra   : additional query params
     */
    public static function url($fileId, array $opts = [])
    {
        $host = isset($opts['host']) ? $opts['host'] : self::hostFor($fileId);
        $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'https';
        $path = $opts['path'] ?? 'download';
        $query = [];

        if (!empty($opts['thumb'])) {
            $query['thumb'] = '1';
        }
        if (!empty($opts['inline'])) {
            $query['inline'] = '1';
        }
        if (!empty($opts['raw'])) {
            $query['raw'] = '1';
        }
        if (!empty($opts['version'])) {
            $query['v'] = substr(md5((string) $opts['version']), 0, 8);
        }
        if (!empty($opts['extra']) && is_array($opts['extra'])) {
            $query = array_merge($query, $opts['extra']);
        }

        $url = $scheme . '://' . $host . '/' . $path . '?id=' . rawurlencode((string) $fileId);
        if (!empty($query)) {
            $url .= '&' . http_build_query($query);
        }
        return $url;
    }
}
