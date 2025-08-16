'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { mentionRegex } from '@/lib/utils'
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'

export default function PostCard({ post }){
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [cText, setCText] = useState('')

  const contentNodes = useMemo(()=>{
    if(!post.content) return null
    const parts = post.content.split(mentionRegex)
    const out = []
    for(let i=0;i<parts.length;i++){
      if(i%2===0) out.push(<span key={i}>{parts[i]}</span>)
      else out.push(<span key={i} className="text-gold">@{parts[i]}</span>)
    }
    return out
  },[post.content])

  const refreshLikes = async()=>{
    const { data } = await supabase.from('likes').select('*').eq('post_id', post.id)
    setLikes(data?.length || 0)
    const { data: { user } } = await supabase.auth.getUser()
    if(user){
      const { data: mine } = await supabase.from('likes').select('post_id').eq('post_id', post.id).eq('user_id', user.id)
      setLiked(!!mine?.length)
    }
  }

  const toggleLike = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    if(liked){
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
    }
    refreshLikes()
  }

  const fetchComments = async()=>{
    const { data } = await supabase.from('comments')
      .select('id, content, created_at, profiles(username, avatar_url)')
      .eq('post_id', post.id).order('created_at', { ascending: true })
    setComments(data||[])
  }

  const addComment = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    if(!cText.trim()) return
    await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content: cText })
    setCText(''); fetchComments()
  }

  useEffect(()=>{ refreshLikes(); fetchComments() }, [post.id])

  return (
    <div>
      <div className="flex items-start gap-3">
        {post.profiles?.avatar_url
          ? <img src={post.profiles.avatar_url} className="h-10 w-10 rounded-full object-cover"/>
          : <div className="h-10 w-10 rounded-full bg-neutral-700" />}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">@{post.profiles?.username || 'user'}</span>
            <span className="opacity-60">{new Date(post.created_at).toLocaleString()}</span>
          </div>

          {post.content && <p className="whitespace-pre-wrap text-[15px] mt-1">{contentNodes}</p>}
          {post.media_url && <img src={post.media_url} alt="media" className="mt-2 max-h-[520px] w-full object-cover rounded-xl"/>}

          {/* aksiyon satırı */}
          <div className="flex items-center gap-6 mt-2">
            <button className="tw-action flex items-center gap-2" onClick={()=>{}}>
              <MessageCircle size={18}/> Reply
            </button>
            <button className="tw-action flex items-center gap-2" onClick={()=>{}}>
              <Repeat2 size={18}/> Repost
            </button>
            <button className={`tw-action flex items-center gap-2 ${liked?'text-gold':''}`} onClick={toggleLike}>
              <Heart size={18}/> {likes}
            </button>
          </div>

          {/* basit reply alanı */}
          <div className="flex items-center gap-2 mt-3">
            <input value={cText} onChange={e=>setCText(e.target.value)} placeholder="Reply…" className="input flex-1"/>
            <button onClick={addComment} className="btn">Send</button>
          </div>

          {/* yorumlar */}
          {comments.length>0 && (
            <div className="mt-3 space-y-2">
              {comments.map(c=>(
                <div key={c.id} className="text-sm opacity-90">
                  <span className="font-medium">@{c.profiles?.username || 'user'}</span>: {c.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
