'use client'
import Link from 'next/link'
import { Home, Compass, MessageCircle, Users, Bell, ListChecks, Star, User, PlusCircle } from 'lucide-react'

const Item = ({ href, icon, label }) => (
  <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-neutral-900">
    {icon}<span className="text-[15px] font-medium">{label}</span>
  </Link>
)

export default function SidebarLeft(){
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3">
        <div className="h-8 w-8 rounded-full" style={{background:'var(--gold)'}} />
        <div className="text-xl font-semibold">Blend</div>
      </div>
      <nav className="flex flex-col">
        <Item href="/" icon={<Home size={22}/>} label="Feed" />
        <Item href="/explore" icon={<Compass size={22}/>} label="Explore" />
        <Item href="/messages" icon={<MessageCircle size={22}/>} label="Messages" />
        <Item href="/groups" icon={<Users size={22}/>} label="Groups" />
        <Item href="/notifications" icon={<Bell size={22}/>} label="Alerts" />
        <Item href="/watchlist" icon={<ListChecks size={22}/>} label="Watchlist" />
        <Item href="/rate" icon={<Star size={22}/>} label="Rate & Review" />
        <Item href="/profile" icon={<User size={22}/>} label="Profile" />
      </nav>
      <button className="btn w-full flex items-center justify-center gap-2">
        <PlusCircle size={18}/> Post
      </button>
    </div>
  )
}
