const KEY = 'zenith-bookmarks-v1'

export const localStorageProvider = {
  async load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  },
  async save(bookmarks) {
    localStorage.setItem(KEY, JSON.stringify(bookmarks))
  },
}

export const googleDriveProvider = {
  async load() { throw new Error('Google Drive sync is not configured yet') },
  async save() { throw new Error('Google Drive sync is not configured yet') },
}
