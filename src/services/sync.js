import { normalizeDocuments } from './model'

export function mergeDocuments(localValues, remoteValues) {
  const local = normalizeDocuments(localValues)
  const remote = normalizeDocuments(remoteValues)
  const byId = new Map()

  for (const document of [...local, ...remote]) {
    const previous = byId.get(document.id)
    if (!previous || document.updatedAt >= previous.updatedAt) byId.set(document.id, document)
  }

  return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function hasChanges(before, after) {
  return JSON.stringify(normalizeDocuments(before)) !== JSON.stringify(normalizeDocuments(after))
}
