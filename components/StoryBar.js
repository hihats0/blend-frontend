'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
export default function StoryBar(){
  const [stories, setStories] = useState([])
  const fetchStories = async()=>{
    const now = new Date().toISOString()
    const { data } = await supabase.from('stories').select('id, media_url, profiles(username, avatar_url)').gt('expires_at', now).order('created_at', { ascending: false }).limit(20)
    setStories(data || [])
  }
  useEffect(()=>{ fetchStories() }, [])
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stories.map((s)=> (
        <div key={s.id} className="flex flex-col items-center min-w-16">
          <div className="h-14 w-14 rounded-full overflow-hidden ring-gold">
            <img src={s.media_url} alt="story" className="h-full w-full object-cover"/>
          </div>
          <span className="text-[11px] mt-1 opacity-80">{s.profiles?.username || 'user'}</span>
        </div>
      ))}
    </div>
  )
}
