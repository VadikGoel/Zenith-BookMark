import test from 'node:test'
import assert from 'node:assert/strict'
import { BLOCK_TYPES, createBlock, createPageBlocks, normalizeBlock, normalizeBlocks } from '../src/services/blocks.js'

test('creates supported block types with identity and timestamps', () => {
  const block = createBlock(BLOCK_TYPES.HEADING, { text: 'Welcome' })
  assert.equal(block.type, BLOCK_TYPES.HEADING)
  assert.equal(block.text, 'Welcome')
  assert.ok(block.id)
  assert.ok(block.createdAt > 0)
  assert.equal(block.createdAt, block.updatedAt)
})

test('preserves todo state and code language', () => {
  const todo = createBlock(BLOCK_TYPES.TODO, { text: 'Ship Zenith', checked: true })
  const code = createBlock(BLOCK_TYPES.CODE, { text: 'console.log(1)', language: 'javascript' })
  assert.equal(todo.checked, true)
  assert.equal(code.language, 'javascript')
})

test('rejects unsupported blocks and filters invalid entries', () => {
  assert.throws(() => createBlock('video'), /Unsupported block type/)
  assert.equal(normalizeBlock({ type: 'video' }), null)
  assert.equal(normalizeBlocks([{ type: BLOCK_TYPES.TEXT, text: 'ok' }, { type: 'video' }]).length, 1)
})

test('creates a usable page starting with one text block', () => {
  const blocks = createPageBlocks()
  assert.equal(blocks.length, 1)
  assert.equal(blocks[0].type, BLOCK_TYPES.TEXT)
})
