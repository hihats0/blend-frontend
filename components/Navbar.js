'use client'
import Link from 'next/link'
import { Home, ListChecks, User, LogIn, LogOut, Star, MessageSquare, Users, Compass, Bell } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar(){
  const [user, setUser] = useState(null)
  const path = usePathname()
  useEffect(()=>{
    supabase.auth.getUser().then(({ data })=> setUser(data?.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s)=> setUser(s?.user || null))
    return ()=> sub?.subscription?.unsubscribe()
  },[])
  const Item = ({ href, icon, label })=> (
    <Link href={href} className={`nav-item ${path===href?'active':''}`}>{icon}{label}</Link>
  )
  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between py-3">
        <div className="flex gap-4">
          <Item href="/" icon={<Home size={22}/>} label="Feed" />
          <Item href="/explore" icon={<Compass size={22}/>} label="Explore" />
          <Item href="/messages" icon={<MessageSquare size={22}/>} label="DM" />
          <Item href="/groups" icon={<Users size={22}/>} label="Groups" />
        </div>
        <div className="flex gap-4">
          <Item href="/watchlist" icon={<ListChecks size={22}/>} label="Watch" />
          <Item href="/rate" icon={<Star size={22}/>} label="Rate" />
          <Item href="/notifications" icon={<Bell size={22}/>} label="Alerts" />
          <Item href="/profile" icon={<User size={22}/>} label="Me" />
          {!user
            ? <Item href="/login" icon={<LogIn size={22}/>} label="Login" />
            : <button onClick={()=> supabase.auth.signOut()} className="text-xs">Logout</button>}
        </div>
      </div>
    </nav>
  )
}
