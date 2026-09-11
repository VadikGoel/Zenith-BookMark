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

test('creates pages and notes with identity and timestamps', () => {
  const page = createDocument(DOCUMENT_TYPES.PAGE, { title: 'My page' })
  const note = createDocument(DOCUMENT_TYPES.NOTE, { title: 'My note', text: 'Hello' })
  assert.equal(page.type, DOCUMENT_TYPES.PAGE)
  assert.equal(note.type, DOCUMENT_TYPES.NOTE)
  assert.equal(note.text, 'Hello')
  assert.ok(page.id)
  assert.ok(note.createdAt > 0)
  assert.equal(page.createdAt, page.updatedAt)
})

test('normalizes arrays and filters invalid entries', () => {
  const documents = normalizeDocuments([
    { id: 'bookmark-1', url: 'https://example.com' },
    { id: 'note-1', type: 'note', title: 'Idea', text: 'Remember this' },
    { id: 'invalid', title: 'No type' },
  ])
  assert.equal(documents.length, 2)
  assert.equal(documents[0].type, DOCUMENT_TYPES.BOOKMARK)
  assert.equal(documents[1].type, DOCUMENT_TYPES.NOTE)
})
