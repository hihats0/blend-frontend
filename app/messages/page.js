'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MessagesPage(){
  const [me, setMe] = useState(null)
  const [threads, setThreads] = useState([])
  const [active, setActive] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')

  useEffect(()=>{ supabase.auth.getUser().then(({data})=> setMe(data?.user||null)) },[])

  const loadThreads = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return
    const { data } = await supabase
      .from('direct_threads')
      .select('id, user_a, user_b, last_message_at, user_a:profiles!direct_threads_user_a_fkey(username,avatar_url), user_b:profiles!direct_threads_user_b_fkey(username,avatar_url)')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('last_message_at', { ascending:false })
    setThreads(data||[])
  }

  const openThread = async(t)=>{
    setActive(t); setMsgs([])
    const { data } = await supabase
      .from('direct_messages')
      .select('id, sender_id, content, media_url, created_at')
      .eq('thread_id', t.id)
      .order('created_at', { ascending:true })
    setMsgs(data||[])
  }

  useEffect(()=>{ loadThreads() },[])
  useEffect(()=>{
    if(!active) return
    const ch = supabase
      .channel('dm-'+active.id)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'direct_messages', filter:`thread_id=eq.${active.id}`},
        payload => setMsgs(m=> [...m, payload.new])
      ).subscribe()
    return ()=> supabase.removeChannel(ch)
  },[active])

  const send = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user || !active || !text.trim()) return
    await supabase.from('direct_messages').insert({ thread_id: active.id, sender_id: user.id, content: text })
    await supabase.from('direct_threads').update({ last_message_at: new Date().toISOString() }).eq('id', active.id)
    setText('')
  }

  const startChat = async()=>{
    if(!search.trim()) return
    const { data: prof } = await supabase.from('profiles').select('id,username').eq('username', search.trim()).maybeSingle()
    if(!prof) return alert('User not found')
    const { data: tid, error } = await supabase.rpc('get_or_create_direct_thread', { other: prof.id })
    if(error) return alert(error.message)
    await loadThreads()
    const t = (threads.find(x=>x.id===tid) || { id: tid })
    openThread(t); setSearch('')
  }

  const their = (t)=>{
    if(!me) return { username:'' }
    const mine = me.id
    const u = (t.user_a?.username && t.user_b?.username)
      ? (t.user_a?.id===mine ? t.user_b : t.user_a)
      : (t.user_a?.username ? t.user_a : t.user_b)
    return u || {}
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-5 md:col-span-4 tw-card p-3">
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="@username" value={search} onChange={e=>setSearch(e.target.value)}/>
          <button className="btn" onClick={startChat}>Chat</button>
        </div>
        <div className="mt-3 divide-y divide-neutral-800">
          {threads.map(t=>{
            const u = their(t)
            return (
              <button key={t.id} className={`w-full text-left py-2 ${active?.id===t.id?'text-gold':''}`} onClick={()=>openThread(t)}>
                @{u.username || 'user'}
              </button>
            )
          })}
          {threads.length===0 && <div className="text-sm opacity-60">No chats yet.</div>}
        </div>
      </aside>

      <main className="col-span-7 md:col-span-8 tw-card p-3 flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {msgs.map(m=>(
            <div key={m.id} className={`max-w-[80%] ${m.sender_id===me?.id?'ml-auto text-right':''}`}>
              <div className="inline-block bg-neutral-900 rounded-2xl px-3 py-2">{m.content}</div>
            </div>
          ))}
          {!active && <div className="text-sm opacity-60">Pick a chat.</div>}
        </div>
        <div className="pt-3 flex gap-2">
          <input className="input flex-1" placeholder="Message…" value={text} onChange={e=>setText(e.target.value)} />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </main>
    </div>
  )
}
