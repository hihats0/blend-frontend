'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { extractMentions } from '@/lib/utils'

export default function PostComposer(){
  const [content, setContent] = useState('')
  const [file, setFile]   = useState(null)
  const [loading, setLoading] = useState(false)

  const onPost = async ()=>{
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user){ alert('Login first'); setLoading(false); return }

      let media_url = null
      if(file){
        const ext  = file.name.split('.').pop()
        const path = `posts/${crypto.randomUUID()}.${ext}`
        const up = await supabase.storage.from('media').upload(path, file, { upsert: true })
        if(up.error) throw up.error
        const { data } = supabase.storage.from('media').getPublicUrl(path)
        media_url = data.publicUrl
      }

      const ins = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        media_url
      })
      if(ins.error) throw ins.error

      // mention notifi (opsiyonel)
      const names = extractMentions(content)
      if(names.length){
        const { data: profs } = await supabase.from('profiles').select('id,username').in('username', names)
        const notif = (profs||[]).map(p => ({ user_id: p.id, type:'mention', payload:{}, created_at:new Date().toISOString() }))
        if(notif.length) await supabase.from('notifications').insert(notif)
      }

      setContent(''); setFile(null)
      window.dispatchEvent(new CustomEvent('refresh-feed'))
    } catch (e){
      alert(e?.message || 'Post error'); console.error(e)
    } finally { setLoading(false) }
  }

  return (
    <div className="card p-4">
      <textarea className="w-full bg-transparent outline-none"
        rows={3}
        placeholder="What's happening?"
        value={content}
        onChange={e=>setContent(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="btn" disabled={loading} onClick={onPost}>
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
