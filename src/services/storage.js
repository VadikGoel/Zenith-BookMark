import { loadOrCreateZenith, writeZenithFile } from './drive'
import { normalizeDocuments } from './model'

const KEY = 'zenith-documents-v3'
const LEGACY_KEY = 'zenith-bookmarks-v2'
const DB = 'zenith-local'
const STORE = 'state'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function localLoad() {
  try {
    const db = await openDb()
    const value = await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    const legacy = value == null ? await new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(LEGACY_KEY)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve([])
    }) : []
    db.close()
    return normalizeDocuments(value ?? legacy)
  } catch {
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || '[]'
      return normalizeDocuments(JSON.parse(raw))
    } catch { return [] }
  }
}

async function localSave(documents) {
  const normalized = normalizeDocuments(documents)
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(normalized, KEY)
      req.onsuccess = resolve
      req.onerror = () => reject(req.error)
    })
    db.close()
  } catch {
    localStorage.setItem(KEY, JSON.stringify(normalized))
  }
}

export const localStorageProvider = { load: localLoad, save: localSave }

export function createGoogleDriveProvider(token) {
  let fileId = null
  return {
    async load() {
      const result = await loadOrCreateZenith(token)
      fileId = result.fileId
      return normalizeDocuments(result.data)
    },
    async save(data) {
      if (!fileId) {
        const result = await loadOrCreateZenith(token)
        fileId = result.fileId
      }
      await writeZenithFile(token, fileId, normalizeDocuments(data))
    },
  }
}
