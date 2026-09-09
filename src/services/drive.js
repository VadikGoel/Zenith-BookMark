const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'
const FILE_NAME = 'zenith_v6.json'

async function check(response) {
  if (!response.ok) {
    let detail = ''
    try { detail = (await response.json())?.error?.message || '' } catch {}
    throw new Error(detail || `Drive request failed (${response.status})`)
  }
  return response
}

export async function findZenithFile(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`)
  const r = await check(await fetch(`${API}/files?q=${q}&spaces=appDataFolder&fields=files(id,name,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` },
  }))
  return (await r.json()).files?.[0] || null
}

export async function createZenithFile(token, data = []) {
  const metadata = { name: FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  const r = await check(await fetch(`${UPLOAD}/files?uploadType=multipart&fields=id,name,modifiedTime`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  }))
  return r.json()
}

export async function readZenithFile(token, fileId) {
  const r = await check(await fetch(`${API}/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  }))
  const data = await r.json()
  return Array.isArray(data) ? data : []
}

export async function writeZenithFile(token, fileId, data) {
  await check(await fetch(`${UPLOAD}/files/${encodeURIComponent(fileId)}?uploadType=media`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }))
}

export async function loadOrCreateZenith(token) {
  const file = await findZenithFile(token)
  if (file) return { fileId: file.id, data: await readZenithFile(token, file.id) }
  const created = await createZenithFile(token, [])
  return { fileId: created.id, data: [] }
}
