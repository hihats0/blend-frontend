'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'
import StoryBar from '@/components/StoryBar'
export default function Feed(){
  const [posts, setPosts] = useState([])
  const fetchPosts = async()=>{
    const { data } = await supabase.from('posts').select('id, content, media_url, created_at, profiles(username, avatar_url)').order('created_at', { ascending: false }).limit(50)
    setPosts(data || [])
  }
  useEffect(()=>{ fetchPosts(); const onR = ()=> fetchPosts(); window.addEventListener('refresh-feed', onR); return ()=> window.removeEventListener('refresh-feed', onR)},[])
  const addStory = async(e)=>{
    const f = e.target.files?.[0]; if(!f) return
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    const ext = f.name.split('.').pop(); const path = `stories/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, f, { upsert: true })
    if(!error){
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      const expires = new Date(Date.now() + 24*60*60*1000).toISOString()
      await supabase.from('stories').insert({ user_id: user.id, media_url: data.publicUrl, expires_at: expires })
    }
  }
  return (<div className="space-y-5">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Feed</h1>
      <label className="text-sm opacity-80 cursor-pointer btn-ghost">+ Story
        <input type="file" accept="image/*,video/*" className="hidden" onChange={addStory}/>
      </label>
    </div>
    <StoryBar />
    <PostComposer />
    <div className="space-y-4">{posts.map(p=> <PostCard key={p.id} post={p} />)}</div>
  </div>)
}
