'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function Notifications(){
  const [items, setItems] = useState([])
  const load = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return setItems([])
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).is('read_at', null).order('created_at', { ascending: false })
    setItems(data||[])
  }
  const markRead = async(id)=>{ await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id); load() }
  useEffect(()=>{ load() },[])
  return (<div className="space-y-3">
    <h1 className="text-xl font-semibold">Alerts</h1>
    {items.map(n=> (<div key={n.id} className="card p-3 flex items-center gap-3">
      <div className="text-sm flex-1">{n.type==='mention' ? <span>Someone mentioned you</span> : <span>Similar taste: {n.payload?.username}</span>}</div>
      <button onClick={()=> markRead(n.id)} className="btn-ghost text-sm">Mark read</button>
    </div>))}
    {items.length===0 && <div className="opacity-60">No new alerts.</div>}
  </div>)
}
