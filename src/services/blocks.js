export const BLOCK_TYPES = Object.freeze({
  TEXT: 'text',
  HEADING: 'heading',
  BULLET: 'bullet',
  TODO: 'todo',
  CODE: 'code',
  IMAGE: 'image',
  DIVIDER: 'divider',
})

const VALID_TYPES = new Set(Object.values(BLOCK_TYPES))

export function createBlock(type = BLOCK_TYPES.TEXT, data = {}) {
  if (!VALID_TYPES.has(type)) throw new Error(`Unsupported block type: ${type}`)
  const now = Date.now()
  return {
    id: data.id || crypto.randomUUID(),
    type,
    text: typeof data.text === 'string' ? data.text : '',
    checked: type === BLOCK_TYPES.TODO ? Boolean(data.checked) : undefined,
    language: type === BLOCK_TYPES.CODE ? (data.language || 'text') : undefined,
    url: type === BLOCK_TYPES.IMAGE ? (data.url || '') : undefined,
    createdAt: Number(data.createdAt) || now,
    updatedAt: Number(data.updatedAt) || now,
    ...data,
    type,
  }
}

export function normalizeBlock(value) {
  if (!value || typeof value !== 'object' || !VALID_TYPES.has(value.type)) return null
  const now = Date.now()
  const createdAt = Number(value.createdAt) || now
  const updatedAt = Number(value.updatedAt) || createdAt
  const block = {
    ...value,
    id: value.id || crypto.randomUUID(),
    type: value.type,
    text: typeof value.text === 'string' ? value.text : '',
    createdAt,
    updatedAt,
  }
  if (value.type === BLOCK_TYPES.TODO) block.checked = Boolean(value.checked)
  if (value.type === BLOCK_TYPES.CODE) block.language = value.language || 'text'
  if (value.type === BLOCK_TYPES.IMAGE) block.url = typeof value.url === 'string' ? value.url : ''
  return block
}

export function normalizeBlocks(values) {
  if (!Array.isArray(values)) return []
  return values.map(normalizeBlock).filter(Boolean)
}

export function createPageBlocks() {
  return [createBlock(BLOCK_TYPES.TEXT)]
}
