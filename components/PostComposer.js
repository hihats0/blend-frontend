'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PostComposer(){
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const onPost = async ()=>{
    setLoading(true)
    try{
      const { data: { session } } = await supabase.auth.getSession()
      if(!session){ alert('Login first'); setLoading(false); return }
      const token = session.access_token

      let media_url = null, kind = 'text'
      if(file){
        kind = 'media'
        const ext = file.name.split('.').pop()
        const path = `posts/${crypto.randomUUID()}.${ext}`
        const up = await supabase.storage.from('media').upload(path, file, { upsert: true })
        if(up.error) throw up.error
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        media_url = data.publicUrl
      }

      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, kind, media_url })
      })
      if(!resp.ok){
        const err = await resp.json().catch(()=>({}))
        throw new Error(err.error || 'Post error')
      }

      setContent(''); setFile(null)
      window.dispatchEvent(new CustomEvent('refresh-feed'))
    }catch(e){ alert(e?.message || 'Post error'); console.error(e) }
    finally{ setLoading(false) }
  }

  return (
    <div className="card p-4">
      <textarea
        className="w-full bg-transparent outline-none placeholder-neutral-500"
        rows={3}
        placeholder="What's happening?"
        value={content}
        onChange={e=>setContent(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)}/>
        <button className="btn" disabled={loading} onClick={onPost}>
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
