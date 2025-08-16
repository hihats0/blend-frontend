'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfilePage(){
  const [user, setUser] = useState(null)
  const [me, setMe] = useState(null)
  const [tab, setTab] = useState('posts') // posts | media | likes
  const [myPosts, setMyPosts] = useState([])
  const [myLikes, setMyLikes] = useState([])

  useEffect(()=>{ supabase.auth.getUser().then(({ data })=> setUser(data?.user || null)) },[])
  useEffect(()=>{ (async()=>{
    if(!user) return
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setMe(prof||null)
    const { data: posts } = await supabase.from('posts').select('id, content, media_url, created_at, profiles(username, avatar_url)').eq('user_id', user.id).order('created_at', { ascending: false })
    setMyPosts(posts||[])
    const { data: lks } = await supabase.from('likes').select('post_id').eq('user_id', user.id)
    const ids = (lks||[]).map(x=> x.post_id)
    if(ids.length){
      const { data: likedPosts } = await supabase.from('posts').select('id, content, media_url, created_at, profiles(username, avatar_url)').in('id', ids).order('created_at', { ascending: false })
      setMyLikes(likedPosts||[])
    }
  })() },[user])

  const updateUsername = async()=>{
    const name = prompt('New username', me?.username || ''); if(!name) return
    await supabase.from('profiles').update({ username: name }).eq('id', user.id)
    setMe({ ...me, username: name })
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

  return (
    <div className="tw-card overflow-hidden">
      {/* banner */}
      <div className="h-40 bg-neutral-900 relative">
        {/* banner resmi istersek ileride ekleriz */}
      </div>

      {/* avatar + ad */}
      <div className="px-4 -mt-10 flex items-end gap-3">
        {me?.avatar_url
          ? <img src={me.avatar_url} className="h-20 w-20 rounded-full ring-4 ring-black object-cover"/>
          : <div className="h-20 w-20 rounded-full ring-4 ring-black bg-neutral-700"/>}
        <div className="flex-1 pb-2">
          <div className="text-xl font-semibold">@{me?.username || 'user'}</div>
          <div className="text-xs opacity-60">{user?.email}</div>
        </div>
        <div className="pb-2 flex gap-2">
          <button onClick={updateUsername} className="btn-ghost text-sm">Edit name</button>
          <label className="btn-ghost text-sm cursor-pointer">Upload avatar<input type="file" accept="image/*" className="hidden" onChange={uploadAvatar}/></label>
        </div>
      </div>

      {/* tabs */}
      <div className="px-4 border-t border-neutral-800 flex gap-6 text-sm">
        {['posts','media','likes'].map(k=>(
          <button key={k} onClick={()=> setTab(k)} className={`py-3 ${tab===k?'text-gold border-b-2 border-[var(--gold)]':''}`}>
            {k.toUpperCase()}
          </button>
        ))}
      </div>

      {/* içerik */}
      <div className="divide-y divide-neutral-800">
        {tab==='posts' && (myPosts.length? myPosts.map(p=>(
          <div key={p.id} className="p-3">{p.content}{p.media_url && <img src={p.media_url} className="mt-2 rounded-xl"/>}</div>
        )): <div className="p-6 text-sm opacity-70">No posts.</div>)}

        {tab==='media' && (myPosts.filter(p=>p.media_url).length? myPosts.filter(p=>p.media_url).map(p=>(
          <div key={p.id} className="p-3"><img src={p.media_url} className="rounded-xl"/></div>
        )): <div className="p-6 text-sm opacity-70">No media.</div>)}

        {tab==='likes' && (myLikes.length? myLikes.map(p=>(
          <div key={p.id} className="p-3">{p.content}{p.media_url && <img src={p.media_url} className="mt-2 rounded-xl"/>}</div>
        )): <div className="p-6 text-sm opacity-70">No likes.</div>)}
      </div>
    </div>
  )
}
