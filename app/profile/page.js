'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function ProfilePage(){
  const [user, setUser] = useState(null); const [me, setMe] = useState(null); const [myRatings, setMyRatings] = useState([])
  useEffect(()=>{ supabase.auth.getUser().then(({ data })=>{ setUser(data?.user || null) }) },[])
  useEffect(()=>{ const run = async()=>{
    if(!user) return
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single(); setMe(prof||null)
    const { data: ratings } = await supabase.from('ratings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20); setMyRatings(ratings||[])
  }; run() },[user])
  const updateUsername = async()=>{
    const name = prompt('New username', me?.username || ''); if(!name) return
    await supabase.from('profiles').update({ username: name }).eq('id', user.id); setMe({ ...me, username: name })
  }
  const uploadAvatar = async(e)=>{
    const f = e.target.files?.[0]; if(!f) return
    const ext = f.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, f, { upsert: true })
    if(!error){
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      setMe({ ...me, avatar_url: data.publicUrl })
    }
  }
  return (<div className="space-y-4">
    <h1 className="text-xl font-semibold">Profile</h1>
    {!user && <div className="opacity-70">Login to see your profile.</div>}
    {user && me && (<div className="space-y-3">
      <div className="flex items-center gap-3">
        {me.avatar_url ? <img src={me.avatar_url} className="h-14 w-14 rounded-full"/> : <div className="h-14 w-14 rounded-full bg-neutral-700"/>}
        <div><div className="text-lg font-medium">@{me.username}</div><div className="text-xs opacity-60">{user.email}</div></div>
        <div className="ml-auto flex gap-2">
          <button onClick={updateUsername} className="btn-ghost text-sm">Edit name</button>
          <label className="btn-ghost text-sm cursor-pointer">Upload avatar<input type="file" accept="image/*" className="hidden" onChange={uploadAvatar}/></label>
        </div>
      </div>
      <div><h2 className="text-lg">Recent ratings</h2><div className="space-y-2 mt-2">{myRatings.map(r=> (<div key={r.id} className="text-sm opacity-90 card p-2"><div className="font-medium">{r.item_type.toUpperCase()} • {r.external_id}</div><div>⭐ {r.rating}</div>{r.review && <div className="opacity-80 mt-1">{r.review}</div>}</div>))}{myRatings.length===0 && <div className="opacity-60">No ratings yet.</div>}</div></div>
    </div>)}
  </div>)
}
