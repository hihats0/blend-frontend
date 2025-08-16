'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
export default function LoginPage(){
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [mode, setMode] = useState('login'); const router = useRouter()
  useEffect(()=>{ supabase.auth.getUser().then(({ data })=>{ if(data?.user) router.replace('/') }) },[router])
  const submit = async()=>{
    if(mode==='login'){
      const { error } = await supabase.auth.signInWithPassword({ email, password }); if(error) return alert(error.message)
      await ensureProfile(); router.replace('/')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password }); if(error) return alert(error.message)
      if(data.user){ await ensureProfile() }
      alert('Signed up. You can login now.'); setMode('login')
    }
  }
  const ensureProfile = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return
    const { data } = await supabase.from('profiles').select('id').eq('id', user.id)
    if(!data?.length){
      const username = email.split('@')[0] + Math.floor(Math.random()*1000)
      await supabase.from('profiles').insert({ id: user.id, username, email })
    }
  }
  return (<div className="space-y-4 max-w-sm mx-auto">
    <h1 className="text-2xl font-semibold">Login</h1>
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="input w-full"/>
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="input w-full"/>
    <button onClick={submit} className="btn w-full">{mode==='login'? 'Login' : 'Sign up'}</button>
    <button onClick={()=> setMode(mode==='login'?'signup':'login')} className="w-full text-sm opacity-70 underline">{mode==='login'? 'Create new account' : 'Back to login'}</button>
  </div>)
}
