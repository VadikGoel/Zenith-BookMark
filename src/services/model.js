export const DOCUMENT_TYPES = Object.freeze({
  BOOKMARK: 'bookmark',
  NOTE: 'note',
  PAGE: 'page',
  WHITEBOARD: 'whiteboard',
})

export function createDocument(type, fields = {}) {
  if (!Object.values(DOCUMENT_TYPES).includes(type)) throw new Error(`Unsupported document type: ${type}`)
  const now = Date.now()
  return {
    id: fields.id || crypto.randomUUID(),
    type,
    title: fields.title || 'Untitled',
    createdAt: fields.createdAt || now,
    updatedAt: fields.updatedAt || now,
    ...fields,
    type,
  }
}

export function normalizeDocument(value) {
  if (!value || typeof value !== 'object') return null
  const inferredType = value.type || (typeof value.url === 'string' ? DOCUMENT_TYPES.BOOKMARK : null)
  if (!Object.values(DOCUMENT_TYPES).includes(inferredType)) return null
  const now = Date.now()
  const createdAt = Number(value.createdAt) || now
  const updatedAt = Number(value.updatedAt) || createdAt
  const deletedAt = Number(value.deletedAt) || 0
  return {
    ...value,
    id: value.id || crypto.randomUUID(),
    type: inferredType,
    title: value.title || (inferredType === DOCUMENT_TYPES.BOOKMARK ? value.url : 'Untitled'),
    createdAt,
    updatedAt,
    ...(deletedAt > 0 ? { deletedAt } : {}),
  }
}

export function normalizeDocuments(values) {
  if (!Array.isArray(values)) return []
  return values.map(normalizeDocument).filter(Boolean)
}
