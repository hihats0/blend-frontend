'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Messages(){
  const [convos, setConvos] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const loadConvos = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return setConvos([])
    const { data } = await supabase.from('conversation_members')
      .select('conversations(id, created_at)')
      .eq('user_id', user.id).order('conversations(created_at)', { ascending: false })
    setConvos((data||[]).map(d=> d.conversations))
  }

  const open = async(convId)=>{
    setActive(convId)
    const { data } = await supabase.from('messages').select('id, content, created_at, profiles(username, avatar_url)').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(200)
    setMessages(data||[])
  }

  const send = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login')
    if(!active || !text.trim()) return
    await supabase.from('messages').insert({ conversation_id: active, user_id: user.id, content: text })
    setText(''); open(active)
  }

  const searchByUsername = async()=>{
    if(!query.trim()) return setResults([])
    const { data } = await supabase.from('profiles').select('id, username, avatar_url').ilike('username', `${query}%`).limit(10)
    setResults(data||[])
  }

  const startChatWith = async(userId)=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login')
    const { data: conv } = await supabase.from('conversations').insert({ created_by: user.id }).select('id').single()
    await supabase.from('conversation_members').insert([{ conversation_id: conv.id, user_id: user.id }, { conversation_id: conv.id, user_id: userId }])
    setQuery(''); setResults([]); loadConvos(); setActive(conv.id); open(conv.id)
  }

  useEffect(()=>{ loadConvos() },[])

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-4 sm:col-span-1 space-y-2">
        <div className="card p-2">
          <div className="text-sm mb-2">New chat by <span className="text-gold">@username</span></div>
          <div className="flex gap-2">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="@nick" className="input flex-1"/>
            <button onClick={searchByUsername} className="btn">Find</button>
          </div>
          <div className="mt-2 space-y-1 max-h-60 overflow-auto">
            {results.map(u=> (
              <button key={u.id} onClick={()=> startChatWith(u.id)} className="w-full text-left px-2 py-2 rounded hover:bg-neutral-900 flex items-center gap-2">
                {u.avatar_url ? <img src={u.avatar_url} className="h-6 w-6 rounded-full"/> : <div className="h-6 w-6 rounded-full bg-neutral-700" />}
                @{u.username}
              </button>
            ))}
          </div>
        </div>
        <div className="card p-2 max-h-[60vh] overflow-auto">
          {convos.map(c=> (
            <button key={c.id} onClick={()=> open(c.id)} className={`block w-full text-left px-2 py-2 rounded ${active===c.id?'bg-neutral-900':''}`}>Chat {c.id.slice(0,8)}</button>
          ))}
          {convos.length===0 && <div className="opacity-60 text-sm">No chats yet.</div>}
        </div>
      </div>
      <div className="col-span-4 sm:col-span-3 flex flex-col gap-2">
        <div className="card p-3 flex-1 min-h-[50vh]">
          {messages.map(m=> (
            <div key={m.id} className="mb-2 text-sm flex items-start gap-2">
              {m.profiles?.avatar_url ? <img src={m.profiles.avatar_url} className="h-6 w-6 rounded-full mt-0.5"/> : <div className="h-6 w-6 rounded-full bg-neutral-700 mt-0.5" />}
              <div><span className="font-medium">@{m.profiles?.username || 'user'}</span> <span className="opacity-60 text-xs">{new Date(m.created_at).toLocaleTimeString()}</span><div>{m.content}</div></div>
            </div>
          ))}
          {active && messages.length===0 && <div className="opacity-60">No messages yet.</div>}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…" className="input flex-1"/>
          <button onClick={send} className="btn">Send</button>
        </div>
      </div>
    </div>
  )
}
