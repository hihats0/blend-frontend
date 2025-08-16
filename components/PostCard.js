'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Heart, MessageCircle } from 'lucide-react'
import { mentionRegex } from '@/lib/utils'

export default function PostCard({ post }){
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

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

  const refresh = async ()=>{
    const { data: dl } = await supabase.from('likes').select('post_id', { count: 'exact', head: true }).eq('post_id', post.id)
    setLikes(dl?.length ?? dl?.count ?? 0)
    const { data: { user } } = await supabase.auth.getUser()
    if(user){
      const { data: mine } = await supabase.from('likes').select('post_id').eq('post_id', post.id).eq('user_id', user.id)
      setLiked(!!mine?.length)
    }
    const { data: cs } = await supabase.from('comments').select('id,user_id,content,created_at,profiles(username)').eq('post_id', post.id).order('created_at',{ascending:true})
    setComments(cs||[])
  }

  useEffect(()=>{ refresh() }, [post.id])

  const toggleLike = async ()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    if(liked){
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
    }
    refresh()
  }

  const addComment = async ()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    if(!text.trim()) return
    await supabase.from('comments').insert({ post_id: post.id, user_id: user.id, content: text })
    setText(''); refresh()
  }

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

          {post.kind==='rating' && <div className="text-xs opacity-70">Rated</div>}
          {post.content && <p className="whitespace-pre-wrap text-[15px] mt-1">{contentNodes}</p>}
          {post.media_url && <img src={post.media_url} className="mt-2 max-h-[520px] w-full object-cover rounded-xl" />}

          <div className="flex items-center gap-6 mt-2">
            <button className="tw-action flex items-center gap-2" onClick={()=>{}}>
              <MessageCircle size={18}/> Reply
            </button>
            <button className={`tw-action flex items-center gap-2 ${liked?'text-gold':''}`} onClick={toggleLike}>
              <Heart size={18}/> {likes}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <input className="input flex-1" placeholder="Reply…" value={text} onChange={e=>setText(e.target.value)}/>
            <button className="btn" onClick={addComment}>Send</button>
          </div>

          {comments.length>0 && (
            <div className="mt-3 space-y-2 text-sm">
              {comments.map(c=>(
                <div key={c.id}><span className="font-medium">@{c.profiles?.username || 'user'}</span>: {c.content}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
