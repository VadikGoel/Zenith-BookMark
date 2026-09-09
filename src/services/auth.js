const CLIENT_ID = '473728201326-h8akh7nju8palihnuopd19qpffm2vdi6.apps.googleusercontent.com'
const SCOPE = 'openid email profile https://www.googleapis.com/auth/drive.appdata'

function waitForGoogle() {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const tick = () => {
      if (window.google?.accounts?.oauth2) return resolve(window.google)
      if (Date.now() - started > 15000) return reject(new Error('Google Identity Services did not load'))
      setTimeout(tick, 100)
    }
    tick()
  })
}

export async function requestDriveToken(prompt = '') {
  const google = await waitForGoogle()
  const response = await new Promise((resolve) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: resolve,
    })
    client.requestAccessToken({ prompt })
  })
  if (!response?.access_token) throw new Error(response?.error_description || 'Google authorization failed')
  let profile = null
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${response.access_token}` } })
    if (r.ok) profile = await r.json()
  } catch {}
  return { token: response.access_token, profile }
}

export function revokeDriveToken(token) {
  if (token && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(token, () => {})
}
