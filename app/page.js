'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'
import StoryBar from '@/components/StoryBar'

export default function Feed(){
  const [posts, setPosts] = useState([])

  const fetchPosts = async()=>{
    const { data } = await supabase
      .from('posts')
      .select('id, content, media_url, created_at, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts(data || [])
  }

  useEffect(()=>{
    fetchPosts()
    const onR = ()=> fetchPosts()
    window.addEventListener('refresh-feed', onR)
    return ()=> window.removeEventListener('refresh-feed', onR)
  },[])

const addStory = async (e) => {
  const f = e.target.files?.[0]; if (!f) return
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return alert('Login first')

  const ext = f.name.split('.').pop()
  const path = `stories/${crypto.randomUUID()}.${ext}`

  // 1) dosyayı storage'a yükle
  const { error } = await supabase.storage.from('media').upload(path, f, { upsert: true })
  if (error) { alert(error.message); return }

  // 2) public URL al
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  const publicUrl = data.publicUrl

  // 3) story tablosuna ekle (24 saatlik)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await supabase.from('stories').insert({
    user_id: user.id,
    media_url: publicUrl,
    expires_at: expires
  })

  // 4) AYNI ANDA feed’e de "post" olarak düş
  await supabase.from('posts').insert({
    user_id: user.id,
    content: '📸 Story paylaştı',
    media_url: publicUrl
  })

  // 5) feed’i yenile
  window.dispatchEvent(new CustomEvent('refresh-feed'))
}


  return (
    <div className="space-y-4">
      {/* üst mini başlık/compose */}
      <div className="tw-card">
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Home</div>
          <label className="text-xs opacity-80 cursor-pointer btn-ghost">+ Story
            <input type="file" accept="image/*,video/*" className="hidden" onChange={addStory}/>
          </label>
        </div>
        <div className="p-3"><StoryBar /></div>
        <div className="tw-item p-3"><PostComposer /></div>
      </div>

      {/* feed */}
      <div className="tw-card">
        {posts.map((p, i)=> (
          <div key={p.id} className="tw-item p-3">
            <PostCard post={p} />
          </div>
        ))}
        {posts.length===0 && <div className="p-6 text-sm opacity-70">No posts yet.</div>}
      </div>
    </div>
  )
}
