'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
async function searchTMDB(q, type='movie'){
  const url = `/api/tmdb/search?q=${encodeURIComponent(q)}&type=${type}`
  const r = await fetch(url); return r.json()
}
export default function WatchlistPage(){
  const [q, setQ] = useState(''); const [type, setType] = useState('movie'); const [results, setResults] = useState([]); const [list, setList] = useState([])
  const search = async()=>{ if(!q.trim()) return; const data = await searchTMDB(q, type); setResults(data?.results || []) }
  const fetchList = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return setList([])
    const { data } = await supabase.from('watchlist').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); setList(data||[])
  }
  const addItem = async(item)=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null
    await supabase.from('watchlist').insert({ user_id: user.id, item_type: type, external_id: `tmdb:${type}:${item.id}`, title: item.title || item.name, poster_url: poster, status: 'planned' }); fetchList()
  }
  const toggleStatus = async(w)=>{ await supabase.from('watchlist').update({ status: w.status==='planned'?'done':'planned' }).eq('id', w.id); fetchList() }
  useEffect(()=>{ fetchList() }, [])
  return (<div className="space-y-4">
    <h1 className="text-xl font-semibold">Watchlist</h1>
    <div className="flex gap-2">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${type}…`} className="input flex-1"/>
      <select value={type} onChange={e=>setType(e.target.value)} className="select"><option value="movie">Movie</option><option value="tv">TV</option></select>
      <button onClick={search} className="btn">Search</button>
    </div>
    {results?.length>0 && (<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {results.map(r=> (<div key={r.id} className="card overflow-hidden">
        {r.poster_path && <img src={`https://image.tmdb.org/t/p/w300${r.poster_path}`} className="w-full h-48 object-cover" alt="poster"/>}
        <div className="p-2 text-sm">{r.title || r.name}
          <button onClick={()=> addItem(r)} className="block mt-2 w-full btn">Add</button>
        </div></div>))}
    </div>)}
    <h2 className="text-lg mt-3">Your list</h2>
    <div className="space-y-2">{list.map(w=> (<div key={w.id} className="flex items-center gap-3 card p-2">
      {w.poster_url && <img src={w.poster_url} alt="p" className="h-14 w-10 object-cover rounded"/>}
      <div className="flex-1"><div className="text-sm font-medium">{w.title}</div><div className="text-xs opacity-60">{w.item_type.toUpperCase()} • {w.status}</div></div>
      <button onClick={()=> toggleStatus(w)} className="btn-ghost text-sm">Toggle</button>
    </div>))}</div>
  </div>)
}
