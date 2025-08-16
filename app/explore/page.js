'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function Explore(){
  const [trending, setTrending] = useState([]); const [range, setRange] = useState(3)
  const fetchTrending = async()=>{
    const since = new Date(Date.now() - range*24*60*60*1000).toISOString()
    const { data: posts } = await supabase.from('posts').select('id, content, media_url, created_at, profiles(username)').gt('created_at', since).order('created_at', { ascending: false }).limit(100)
    const withLikes = await Promise.all((posts||[]).map(async p=>{
      const { count } = await supabase.from('likes').select('*', { count:'exact', head:true }).eq('post_id', p.id)
      return { ...p, like_count: count||0 }
    }))
    withLikes.sort((a,b)=> b.like_count - a.like_count)
    setTrending(withLikes.slice(0, 30))
  }
  useEffect(()=>{ fetchTrending() }, [range])
  return (<div className="space-y-4">
    <div className="flex items-center gap-3">
      <h1 className="text-xl font-semibold">Explore</h1>
      <select className="select" value={range} onChange={e=> setRange(+e.target.value)}><option value={1}>24h</option><option value={3}>3d</option><option value={7}>7d</option></select>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {trending.map(t=> (<div key={t.id} className="card p-2 text-sm">
        {t.media_url && <img src={t.media_url} className="mb-2 max-h-48 w-full object-cover" alt="media"/>}
        <div className="opacity-60">@{t.profiles?.username}</div>
        <div className="font-medium line-clamp-3">{t.content}</div>
        <div className="text-xs opacity-60 mt-1">❤ {t.like_count}</div>
      </div>))}
    </div>
  </div>)
}
