'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { extractMentions } from '@/lib/utils'

export default function PostComposer(){
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const onPost = async()=>{
    setLoading(true)
    let media_url = null
    if(file){
      const ext = file.name.split('.').pop()
      const path = `posts/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
      if(!error){
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        media_url = data.publicUrl
      }
    }
    const { data: { user } } = await supabase.auth.getUser()
    if(!user){ setLoading(false); alert('Login first'); return }
    const { data: post, error } = await supabase.from('posts').insert({ user_id: user.id, content, media_url }).select('*').single()
    if(!error && post){
      const usernames = extractMentions(content)
      if(usernames.length){
        const { data: profs } = await supabase.from('profiles').select('id, username').in('username', usernames)
        const notif = profs?.map(p=> ({ user_id: p.id, type: 'mention', payload: { post_id: post.id, by: user.id } })) || []
        if(notif.length) await supabase.from('notifications').insert(notif)
      }
    }
    setContent(''); setFile(null); setLoading(false)
    window.dispatchEvent(new CustomEvent('refresh-feed'))
  }

  return (
    <div className="card p-4">
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="What's happening? @someone"
        className="w-full resize-none bg-transparent outline-none placeholder-neutral-500" rows={3} />
      <div className="mt-3 flex items-center gap-3">
        <input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button disabled={loading} onClick={onPost} className="btn">{loading? 'Posting…' : 'Post'}</button>
      </div>
    </div>
  )
}
