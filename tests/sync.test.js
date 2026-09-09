import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeDocuments, visibleDocuments } from '../src/services/sync.js'

test('merge prefers the newest document version', () => {
  const older = { id: '1', type: 'bookmark', url: 'https://example.com', title: 'Old', createdAt: 1, updatedAt: 10 }
  const newer = { ...older, title: 'New', updatedAt: 20 }
  const merged = mergeDocuments([older], [newer])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].title, 'New')
})

test('a newer deletion wins over an older live copy', () => {
  const live = { id: '1', type: 'bookmark', url: 'https://example.com', title: 'Example', createdAt: 1, updatedAt: 10 }
  const deleted = { ...live, deletedAt: 20, updatedAt: 20 }
  const merged = mergeDocuments([live], [deleted])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].deletedAt, 20)
  assert.equal(visibleDocuments(merged).length, 0)
})

test('an older deletion does not hide a newer edit', () => {
  const deleted = { id: '1', type: 'bookmark', url: 'https://example.com', title: 'Example', createdAt: 1, updatedAt: 10, deletedAt: 10 }
  const edited = { ...deleted, title: 'Updated', updatedAt: 20, deletedAt: undefined }
  const merged = mergeDocuments([deleted], [edited])
  assert.equal(visibleDocuments(merged).length, 1)
  assert.equal(visibleDocuments(merged)[0].title, 'Updated')
})

test('deduplicates bookmarks with equivalent URLs', () => {
  const first = { id: 'local', type: 'bookmark', url: 'https://Example.com/', title: 'Local', createdAt: 1, updatedAt: 10 }
  const second = { id: 'remote', type: 'bookmark', url: 'https://example.com', title: 'Remote', createdAt: 2, updatedAt: 20 }
  const merged = mergeDocuments([first], [second])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].id, 'remote')
})

test('keeps the newest tombstone when duplicate URLs exist', () => {
  const live = { id: 'local', type: 'bookmark', url: 'https://example.com', title: 'Local', createdAt: 1, updatedAt: 10 }
  const deleted = { id: 'remote', type: 'bookmark', url: 'https://example.com/', title: 'Remote', createdAt: 2, updatedAt: 20, deletedAt: 20 }
  const merged = mergeDocuments([live], [deleted])
  assert.equal(merged.length, 1)
  assert.equal(visibleDocuments(merged).length, 0)
})
