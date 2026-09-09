import test from 'node:test'
import assert from 'node:assert/strict'
import { createDocument, DOCUMENT_TYPES, normalizeDocument, normalizeDocuments } from '../src/services/model.js'

test('migrates a legacy bookmark without a type', () => {
  const document = normalizeDocument({ id: 'legacy-1', url: 'https://example.com', title: 'Example', createdAt: 100 })
  assert.equal(document.type, DOCUMENT_TYPES.BOOKMARK)
  assert.equal(document.id, 'legacy-1')
  assert.equal(document.url, 'https://example.com')
})

test('rejects unsupported documents', () => {
  assert.equal(normalizeDocument({ id: 'bad', title: 'Unknown' }), null)
})

test('creates documents with identity and timestamps', () => {
  const document = createDocument(DOCUMENT_TYPES.PAGE, { title: 'My page' })
  assert.equal(document.type, DOCUMENT_TYPES.PAGE)
  assert.equal(document.title, 'My page')
  assert.ok(document.id)
  assert.ok(document.createdAt > 0)
  assert.equal(document.createdAt, document.updatedAt)
})

test('normalizes arrays and filters invalid entries', () => {
  const documents = normalizeDocuments([
    { id: 'bookmark-1', url: 'https://example.com' },
    { id: 'invalid', title: 'No type' },
  ])
  assert.equal(documents.length, 1)
  assert.equal(documents[0].type, DOCUMENT_TYPES.BOOKMARK)
})
