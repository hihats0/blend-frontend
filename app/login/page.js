'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Eğer zaten login’se bu sayfaya girince direkt anasayfaya at
  useEffect(()=>{
    supabase.auth.getUser().then(({ data })=>{
      if(data?.user) router.replace('/')
    })
  },[router])

  const ensureProfile = async()=>{
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return
    const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
    if(!data){
      const username = (email.split('@')[0] || 'user') + Math.floor(Math.random()*1000)
      await supabase.from('profiles').insert({ id: user.id, username, email })
    }
  }

  const submit = async()=>{
    if(!email || !password) return alert('Email ve şifre gir')
    setLoading(true)
    try{
      if(mode==='login'){
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        await ensureProfile()
        router.replace('/')        // ✅ login sonrası direkt akış
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if(error) throw error

        // Eğer Supabase’te “Confirm email” KAPALI ise direkt user gelir
        if(data?.user){
          await ensureProfile()
          router.replace('/')      // ✅ signup sonrası direkt akış
        } else {
          // Confirm AÇIKSA uyarı (dev’de kapatmanı önermiştim)
          alert('E-posta doğrulaması açık görünüyor. Supabase → Auth → Email → Confirm Email kapat (dev için).')
        }
      }
    } catch (e){
      // email not confirmed vb. durumlar
      alert(e?.message || 'Giriş/Üyelik hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold">{mode==='login' ? 'Login' : 'Sign up'}</h1>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="input w-full"/>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="input w-full"/>

      <button disabled={loading} onClick={submit} className="btn w-full">
        {loading ? 'Please wait…' : (mode==='login' ? 'Login' : 'Create account')}
      </button>

      <button onClick={()=> setMode(mode==='login'?'signup':'login')} className="w-full text-sm opacity-70 underline">
        {mode==='login' ? 'Hesabın yok mu? Sign up' : 'Zaten hesabın var mı? Login'}
      </button>
    </div>
  )
}
