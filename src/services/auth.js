const CLIENT_ID = '473728201326-h8akh7nju8palihnuopd19qpffm2vdi6.apps.googleusercontent.com'
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'

let clientPromise

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
  if (!clientPromise) {
    clientPromise = new Promise((resolve) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (response) => resolve(response),
      })
      client.requestAccessToken({ prompt })
    })
  } else {
    clientPromise = new Promise((resolve) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: resolve,
      })
      client.requestAccessToken({ prompt })
    })
  }
  const response = await clientPromise
  if (!response?.access_token) throw new Error(response?.error_description || 'Google authorization failed')
  return response.access_token
}

export function revokeDriveToken(token) {
  if (token && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(token, () => {})
}
