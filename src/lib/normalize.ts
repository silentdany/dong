export type TargetType = 'url' | 'handle'

export type NormalizedTarget = {
  targetType: TargetType
  targetKey: string
  targetUrl: string
  label: string
}

export type NormalizeResult =
  | { ok: true; target: NormalizedTarget }
  | { ok: false; reason: 'invalid' | 'blocked' }

const TRACKING_PARAMS = new Set([
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'twclid', 'ttclid', 'yclid',
  'igshid', 'igsh', 'mibextid', 'mc_cid', 'mc_eid', 'vero_id', '_hsenc', '_hsmi',
  'ref', 'ref_src', 'ref_url', 'referrer', 'source', 'src', 'si', 'spm',
  'campaign', 'cmpid', 'trk', 'trkid', 'sc_channel', 'sc_campaign',
])

/** Hosts whose identity lives in the path (plus, at most, these params). */
const PATH_KEYED_HOSTS: Record<string, string[]> = {
  'apps.apple.com': [],
  'itunes.apple.com': [],
  'testflight.apple.com': [],
  'play.google.com': ['id'],
  'github.com': [],
  'gitlab.com': [],
  'npmjs.com': [],
  'crates.io': [],
  'pypi.org': [],
  'marketplace.visualstudio.com': ['itemName'],
  'chromewebstore.google.com': [],
}

const BLOCKED_HOSTS = new Set([
  't.me', 'telegram.me', 'telegram.dog', 'telesco.pe',
  'chat.whatsapp.com', 'wa.me', 'api.whatsapp.com', 'whatsapp.com',
  'discord.gg', 'discordapp.com', 'discord.com',
  'signal.group', 'signal.me',
  'join.skype.com',
])

const BLOCKED_HOST_FRAGMENTS = [
  'porn', 'xxx', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'youporn', 'spankbang',
  'pornhub', 'onlyfans', 'fansly', 'chaturbate', 'stripchat', 'camsoda', 'bongacams',
  'myfreecams', 'brazzers', 'nsfw', 'hentai', 'rule34', 'escort', 'fapello', 'erome',
]

const X_HOSTS = new Set(['x.com', 'twitter.com', 'mobile.twitter.com', 'mobile.x.com'])
const HANDLE_RE = /^[a-z0-9_]{1,15}$/

function stripWww(host: string): string {
  return host.startsWith('www.') ? host.slice(4) : host
}

function isBlockedHost(host: string): boolean {
  if (BLOCKED_HOSTS.has(host)) return true
  return BLOCKED_HOST_FRAGMENTS.some((fragment) => host.includes(fragment))
}

function normalizeHandle(raw: string): NormalizeResult {
  const handle = raw.trim().replace(/^@/, '').toLowerCase()
  if (!HANDLE_RE.test(handle)) return { ok: false, reason: 'invalid' }
  return {
    ok: true,
    target: {
      targetType: 'handle',
      targetKey: `handle:${handle}`,
      targetUrl: `https://x.com/${handle}`,
      label: `@${handle}`,
    },
  }
}

/** Keep only params that identify the thing, drop the ones that track the click. */
function keyQuery(host: string, params: URLSearchParams): string {
  const allowed = PATH_KEYED_HOSTS[host]
  const kept: [string, string][] = []

  for (const [key, value] of params) {
    const lower = key.toLowerCase()
    if (allowed) {
      if (allowed.includes(key)) kept.push([key, value])
      continue
    }
    if (lower.startsWith('utm_') || TRACKING_PARAMS.has(lower)) continue
    kept.push([key, value])
  }

  kept.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  return kept.map(([key, value]) => `${key}=${value}`).join('&')
}

function normalizeUrl(raw: string): NormalizeResult {
  let url: URL
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`)
  } catch {
    return { ok: false, reason: 'invalid' }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, reason: 'invalid' }

  const host = stripWww(url.hostname.toLowerCase())
  if (!host.includes('.')) return { ok: false, reason: 'invalid' }
  if (isBlockedHost(host)) return { ok: false, reason: 'blocked' }

  // An X profile URL is the same listing as the bare handle.
  if (X_HOSTS.has(host)) {
    const segment = url.pathname.split('/').filter(Boolean)[0]
    if (segment && HANDLE_RE.test(segment.toLowerCase())) return normalizeHandle(segment)
  }

  const path = url.pathname.replace(/\/+$/, '')
  const query = keyQuery(host, url.searchParams)
  const suffix = query ? `?${query}` : ''

  return {
    ok: true,
    target: {
      targetType: 'url',
      targetKey: `url:${host}${path}${suffix}`,
      targetUrl: `https://${host}${path}${suffix}`,
      label: `${host}${path}`,
    },
  }
}

export function normalizeTarget(raw: string): NormalizeResult {
  const value = raw.trim()
  if (!value) return { ok: false, reason: 'invalid' }
  if (value.startsWith('@') || HANDLE_RE.test(value.toLowerCase())) return normalizeHandle(value)
  return normalizeUrl(value)
}
