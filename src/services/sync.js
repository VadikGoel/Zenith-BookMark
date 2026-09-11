import { normalizeDocuments } from './model.js'

function canonicalUrl(value) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    url.hash = ''
    url.hostname = url.hostname.toLowerCase()
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim().replace(/\/$/, '').toLowerCase() || null
  }
}

export function mergeDocuments(localValues, remoteValues) {
  const local = normalizeDocuments(localValues)
  const remote = normalizeDocuments(remoteValues)
  const byId = new Map()
  const aliases = new Map()

  for (const document of [...local, ...remote]) {
    const previous = byId.get(document.id)
    if (!previous || document.updatedAt >= previous.updatedAt) byId.set(document.id, document)
  }

  for (const document of byId.values()) {
    if (document.type !== 'bookmark') continue
    const key = canonicalUrl(document.url)
    if (!key) continue
    const previousId = aliases.get(key)
    if (!previousId) {
      aliases.set(key, document.id)
      continue
    }
    const previous = byId.get(previousId)
    if (!previous || document.updatedAt >= previous.updatedAt) {
      byId.delete(previousId)
      aliases.set(key, document.id)
    } else {
      byId.delete(document.id)
    }
  }

  return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function visibleDocuments(values) {
  return normalizeDocuments(values).filter(document => !document.deletedAt)
}

export function hasChanges(before, after) {
  return JSON.stringify(normalizeDocuments(before)) !== JSON.stringify(normalizeDocuments(after))
}
