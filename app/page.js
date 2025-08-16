'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'

export default function Feed(){
  const [posts, setPosts] = useState([])

  const fetchPosts = async ()=>{
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, media_url, created_at, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)
    if(!error) setPosts(data || [])
  }

  useEffect(()=>{
    fetchPosts()
    const onR = ()=> fetchPosts()
    window.addEventListener('refresh-feed', onR)
    return ()=> window.removeEventListener('refresh-feed', onR)
  },[])

  return (
    <div className="space-y-4">
      <div className="tw-card">
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Home</div>
        </div>
        <div className="p-3"><PostComposer /></div>
      </div>

      <div className="tw-card">
        {posts.map(p=> (
          <div key={p.id} className="tw-item p-3">
            <PostCard post={p} />
          </div>
        ))}
        {posts.length===0 && <div className="p-6 text-sm opacity-70">No posts yet.</div>}
      </div>
    </div>
  )
}
