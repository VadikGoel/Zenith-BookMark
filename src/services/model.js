export const DOCUMENT_TYPES = Object.freeze({
  BOOKMARK: 'bookmark',
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
  if (!Object.values(DOCUMENT_TYPES).includes(value.type)) return null
  const now = Date.now()
  return {
    ...value,
    id: value.id || crypto.randomUUID(),
    title: value.title || 'Untitled',
    createdAt: Number(value.createdAt) || now,
    updatedAt: Number(value.updatedAt) || Number(value.createdAt) || now,
  }
}

export function normalizeDocuments(values) {
  if (!Array.isArray(values)) return []
  return values.map(normalizeDocument).filter(Boolean)
}
