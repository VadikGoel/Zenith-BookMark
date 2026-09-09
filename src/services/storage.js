import { loadOrCreateZenith, writeZenithFile } from './drive'

const KEY = 'zenith-bookmarks-v2'
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
    db.close()
    return Array.isArray(value) ? value : []
  } catch {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  }
}

async function localSave(bookmarks) {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(bookmarks, KEY)
    req.onsuccess = resolve
    req.onerror = () => reject(req.error)
  })
  db.close()
}

export const localStorageProvider = { load: localLoad, save: localSave }

export function createGoogleDriveProvider(token) {
  let fileId = null
  return {
    async load() {
      const result = await loadOrCreateZenith(token)
      fileId = result.fileId
      return result.data
    },
    async save(data) {
      if (!fileId) {
        const result = await loadOrCreateZenith(token)
        fileId = result.fileId
      }
      await writeZenithFile(token, fileId, data)
    },
  }
}
