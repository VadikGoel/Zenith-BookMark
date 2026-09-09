const VERSION = 'z1'

const bytesToBase64Url = (bytes) => {
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const base64UrlToBytes = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
  const binary = atob(base64)
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}

export async function encodeShareDocument(document) {
  const json = JSON.stringify({ v: 1, ...document })
  const source = new TextEncoder().encode(json)
  if ('CompressionStream' in window) {
    const stream = new Blob([source]).stream().pipeThrough(new CompressionStream('gzip'))
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer())
    return `${VERSION}.${bytesToBase64Url(compressed)}`
  }
  return `${VERSION}.${bytesToBase64Url(source)}`
}

export async function decodeShareDocument(payload) {
  const [version, encoded] = payload.split('.', 2)
  if (version !== VERSION || !encoded) throw new Error('Invalid Zenith share link')
  const bytes = base64UrlToBytes(encoded)
  let data = bytes
  if ('DecompressionStream' in window) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
      data = new Uint8Array(await new Response(stream).arrayBuffer())
    } catch { /* allow uncompressed fallback */ }
  }
  return JSON.parse(new TextDecoder().decode(data))
}
