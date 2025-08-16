'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RightRail(){
  const [top, setTop] = useState([])

  useEffect(()=>{ (async()=>{
    // son 3 günde en çok like alan 5 post (basit trend)
    const since = new Date(Date.now() - 3*24*60*60*1000).toISOString()
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, profiles(username)')
      .gt('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)
    const likeCounts = await Promise.all((posts||[]).map(async p=>{
      const { count } = await supabase.from('likes').select('*', { count:'exact', head:true }).eq('post_id', p.id)
      return { ...p, likeCount: count || 0 }
    }))
    likeCounts.sort((a,b)=> b.likeCount - a.likeCount)
    setTop(likeCounts.slice(0,5))
  })() },[])

  return (
    <div className="sticky-top space-y-4">
      <div className="tw-card p-3">
        <input className="tw-input w-full" placeholder="Search Blend…" />
      </div>

      <div className="tw-card p-3">
        <div className="text-lg font-semibold mb-2">Trending</div>
        <div className="divide-y divide-neutral-800">
          {top.map(t=>(
            <div key={t.id} className="py-2">
              <div className="text-sm opacity-70">@{t.profiles?.username}</div>
              <div className="text-[15px] line-clamp-2">{t.content}</div>
              <div className="text-xs opacity-60 mt-1">❤ {t.likeCount}</div>
            </div>
          ))}
          {top.length===0 && <div className="text-sm opacity-60">No trends yet.</div>}
        </div>
      </div>

      <div className="tw-card p-3">
        <div className="text-lg font-semibold mb-2">Who to follow</div>
        <div className="space-y-2 text-sm opacity-80">
          <div>Çok yakında — benzer zevke göre öneriler</div>
        </div>
      </div>
    </div>
  )
}
