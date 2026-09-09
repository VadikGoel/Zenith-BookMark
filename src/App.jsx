import { useEffect, useMemo, useState } from 'react'
import { encodeShareDocument } from './services/share'
import { localStorageProvider } from './services/storage'

const nav = [{id:'all',label:'All bookmarks',icon:'⌁'},{id:'favorites',label:'Favorites',icon:'★'},{id:'today',label:'Today',icon:'◷'},{id:'shared',label:'Shared',icon:'↗'}]

function favicon(url){ try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64` } catch { return '' } }
function domain(url){ try{return new URL(url).hostname.replace(/^www\./,'')}catch{return url} }

export default function App(){
  const [items,setItems]=useState([]),[query,setQuery]=useState(''),[view,setView]=useState('all'),[input,setInput]=useState(''),[toast,setToast]=useState('')
  useEffect(()=>{localStorageProvider.load().then(setItems)},[])
  const save = next => { setItems(next); localStorageProvider.save(next) }
  const add = () => { let url=input.trim(); if(!url)return; if(!/^https?:\/\//i.test(url))url='https://'+url; try{new URL(url)}catch{return flash('Enter a valid URL')} save([{id:crypto.randomUUID(),url,title:domain(url),createdAt:Date.now(),favorite:false},...items]);setInput('');flash('Bookmark saved') }
  const remove=id=>{save(items.filter(x=>x.id!==id));flash('Bookmark removed')}
  const toggle=id=>save(items.map(x=>x.id===id?{...x,favorite:!x.favorite}:x))
  const share=async item=>{const payload=await encodeShareDocument({type:'bookmark',title:item.title,url:item.url,createdAt:item.createdAt});const link=`${location.origin}/s/${payload}`;await navigator.clipboard.writeText(link);flash('Portable share link copied')}
  const flash=t=>{setToast(t);setTimeout(()=>setToast(''),2200)}
  const filtered=useMemo(()=>items.filter(x=>{const q=query.toLowerCase();const matches=!q||x.url.toLowerCase().includes(q)||x.title.toLowerCase().includes(q);const today=new Date(x.createdAt).toDateString()===new Date().toDateString();return matches&&(view==='all'||view==='favorites'&&x.favorite||view==='today'&&today||view==='shared')}),[items,query,view])
  return <div className="app">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">Z</span><span>zenith</span></div><div className="nav">{nav.map(n=><button key={n.id} className={view===n.id?'active':''} onClick={()=>setView(n.id)}><b>{n.icon}</b>{n.label}{n.id==='all'&&<em>{items.length}</em>}</button>)}</div><div className="side-bottom"><button>⚙ Settings</button><div className="storage"><span></span><div><strong>Local vault</strong><small>Ready to sync with Drive</small></div></div></div></aside>
    <main><header><div><p className="eyebrow">YOUR SPACE</p><h1>{view==='all'?'Bookmarks':nav.find(n=>n.id===view)?.label}</h1></div><div className="avatar">V</div></header>
      <section className="hero"><div><span className="spark">✦</span><h2>Capture the web.<br/><i>Keep what matters.</i></h2><p>A calm, private home for your links, notes and ideas.</p></div><div className="hero-orb"><span>✦</span></div></section>
      <div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your bookmarks..."/><kbd>⌘ K</kbd></div></div>
      <section className="add"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Paste a link to save it..."/><button onClick={add}>Add bookmark <span>↵</span></button></section>
      <div className="section-title"><span>{filtered.length} {filtered.length===1?'bookmark':'bookmarks'}</span><span className="view-label">▦ Grid</span></div>
      <div className="grid">{filtered.map(x=><article className="card" key={x.id}><div className="card-top"><img src={favicon(x.url)} onError={e=>e.currentTarget.style.visibility='hidden'}/><button className={x.favorite?'fav on':'fav'} onClick={()=>toggle(x.id)}>★</button></div><h3>{x.title}</h3><p>{domain(x.url)}</p><a href={x.url} target="_blank" rel="noreferrer">Open link ↗</a><div className="card-actions"><button onClick={()=>share(x)}>Share</button><button onClick={()=>remove(x.id)}>Delete</button></div></article>)}{!filtered.length&&<div className="empty"><div>⌁</div><h3>Nothing here yet</h3><p>Add your first bookmark above.</p></div>}</div>
    </main>{toast&&<div className="toast">✓ {toast}</div>}
  </div>
}
