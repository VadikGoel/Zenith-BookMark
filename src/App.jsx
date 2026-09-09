import { useEffect, useMemo, useState } from 'react'
import { decodeShareDocument, encodeShareDocument } from './services/share'
import { createGoogleDriveProvider, localStorageProvider } from './services/storage'
import { requestDriveToken } from './services/auth'

const nav = [
  { id: 'all', label: 'All bookmarks', icon: '⌁' },
  { id: 'favorites', label: 'Favorites', icon: '★' },
  { id: 'today', label: 'Today', icon: '◷' },
]

function favicon(url) { try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` } catch { return '' } }
function domain(url) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }

function SharedView({ document, onSave }) {
  const [saved, setSaved] = useState(false)
  const item = document?.type === 'bookmark' ? document : null
  if (!item) return <div className="shared-shell"><div className="empty"><h3>Invalid Zenith share</h3><p>This link does not contain a supported document.</p></div></div>
  return <div className="shared-shell"><div className="shared-card"><div className="brand"><span className="brand-mark">Z</span><span>zenith</span></div><p className="eyebrow">SHARED WITH YOU</p><h1>{item.title || domain(item.url)}</h1><p className="shared-domain">{domain(item.url)}</p><a className="shared-open" href={item.url} target="_blank" rel="noreferrer">Open original link ↗</a><button className="save-share" disabled={saved} onClick={async () => { await onSave(item); setSaved(true) }}>{saved ? 'Saved to Zenith' : 'Save to my Zenith'}</button><small>This share contains the document itself. No Zenith storage is used for the shared bookmark.</small></div></div>
}

export default function App() {
  const [shared, setShared] = useState(null)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [view, setView] = useState('all')
  const [input, setInput] = useState('')
  const [toast, setToast] = useState('')
  const [drive, setDrive] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const match = location.pathname.match(/^\/s\/(.+)$/)
    if (match) decodeShareDocument(match[1]).then(setShared).catch(() => setShared({ type: 'invalid' }))
    localStorageProvider.load().then(setItems)
  }, [])

  const flash = (message) => { setToast(message); setTimeout(() => setToast(''), 2200) }
  const saveLocal = async (next) => { setItems(next); await localStorageProvider.save(next) }

  const syncNow = async (provider, data = items) => {
    setSyncing(true)
    try { await provider.save(data); flash('Synced to your Google Drive') } catch (error) { flash(error.message || 'Drive sync failed') } finally { setSyncing(false) }
  }

  const signIn = async () => {
    try {
      const token = await requestDriveToken('')
      const provider = createGoogleDriveProvider(token)
      const remote = await provider.load()
      const local = await localStorageProvider.load()
      const merged = remote.length ? remote : local
      setDrive(provider); setSignedIn(true); setItems(merged)
      await localStorageProvider.save(merged)
      if (!remote.length && local.length) await provider.save(local)
      flash('Google Drive connected')
    } catch (error) { flash(error.message || 'Google sign-in failed') }
  }

  const save = async (next) => {
    await saveLocal(next)
    if (drive) await syncNow(drive, next)
  }

  const add = async () => {
    let url = input.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    try { new URL(url) } catch { return flash('Enter a valid URL') }
    const item = { id: crypto.randomUUID(), url, title: domain(url), createdAt: Date.now(), favorite: false }
    await save([item, ...items]); setInput(''); flash('Bookmark saved')
  }

  const remove = async (id) => { await save(items.filter(x => x.id !== id)); flash('Bookmark removed') }
  const toggle = async (id) => { await save(items.map(x => x.id === id ? { ...x, favorite: !x.favorite } : x)) }
  const share = async (item) => {
    try {
      const payload = await encodeShareDocument({ type: 'bookmark', title: item.title, url: item.url, createdAt: item.createdAt })
      const link = `${location.origin}/s/${payload}`
      await navigator.clipboard.writeText(link)
      flash('Portable share link copied')
    } catch { flash('Could not create share link') }
  }

  const saveShared = async (document) => {
    const item = { id: crypto.randomUUID(), url: document.url, title: document.title || domain(document.url), createdAt: Date.now(), favorite: false }
    const local = await localStorageProvider.load()
    const next = [item, ...local.filter(x => x.url !== item.url)]
    await localStorageProvider.save(next)
    if (drive) await drive.save(next)
  }

  const filtered = useMemo(() => items.filter(x => {
    const q = query.toLowerCase()
    const matches = !q || x.url.toLowerCase().includes(q) || x.title.toLowerCase().includes(q)
    const today = new Date(x.createdAt).toDateString() === new Date().toDateString()
    return matches && (view === 'all' || (view === 'favorites' && x.favorite) || (view === 'today' && today))
  }), [items, query, view])

  if (shared) return <SharedView document={shared} onSave={saveShared} />

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">Z</span><span>zenith</span></div>
      <div className="nav">{nav.map(n => <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => setView(n.id)}><b>{n.icon}</b>{n.label}{n.id === 'all' && <em>{items.length}</em>}</button>)}</div>
      <div className="side-bottom">
        <button onClick={signIn}>{signedIn ? '✓ Google Drive' : '☁ Connect Google Drive'}</button>
        <div className="storage"><span></span><div><strong>{signedIn ? 'Cloud vault' : 'Local vault'}</strong><small>{syncing ? 'Syncing…' : signedIn ? 'Private Google Drive storage' : 'Works offline'}</small></div></div>
      </div>
    </aside>
    <main>
      <header><div><p className="eyebrow">YOUR SPACE</p><h1>{view === 'all' ? 'Bookmarks' : nav.find(n => n.id === view)?.label}</h1></div><div className="avatar">Z</div></header>
      <section className="hero"><div><span className="spark">✦</span><h2>Capture the web.<br/><i>Keep what matters.</i></h2><p>A private home for your links today, with notes, pages and whiteboards coming next.</p></div><div className="hero-orb"><span>✦</span></div></section>
      <div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your bookmarks..."/><kbd>⌘ K</kbd></div></div>
      <section className="add"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Paste a link to save it..."/><button onClick={add}>Add bookmark <span>↵</span></button></section>
      <div className="section-title"><span>{filtered.length} {filtered.length === 1 ? 'bookmark' : 'bookmarks'}</span><span className="view-label">▦ Grid</span></div>
      <div className="grid">{filtered.map(x => <article className="card" key={x.id}>
        <div className="card-top"><img src={favicon(x.url)} onError={e => e.currentTarget.style.visibility = 'hidden'} /><button className={x.favorite ? 'fav on' : 'fav'} onClick={() => toggle(x.id)}>★</button></div>
        <h3>{x.title}</h3><p>{domain(x.url)}</p><a href={x.url} target="_blank" rel="noreferrer">Open link ↗</a>
        <div className="card-actions"><button onClick={() => share(x)}>Share</button><button onClick={() => remove(x.id)}>Delete</button></div>
      </article>)}{!filtered.length && <div className="empty"><div>⌁</div><h3>Nothing here yet</h3><p>Add your first bookmark above.</p></div>}</div>
    </main>{toast && <div className="toast">✓ {toast}</div>}
  </div>
}
