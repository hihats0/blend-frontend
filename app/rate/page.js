'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
export default function RatePage(){
  const [externalId, setExternalId] = useState(''); const [type, setType] = useState('movie'); const [rating, setRating] = useState(8); const [review, setReview] = useState('')
  const submit = async()=>{
    const { data: { user } } = await supabase.auth.getUser(); if(!user) return alert('Login first')
    if(!externalId) return alert('Use a TMDB id or watchlist item external_id')
    await supabase.from('ratings').insert({ user_id: user.id, item_type: type, external_id: externalId, rating, review }); alert('Saved rating')
  }
  return (<div className="space-y-4 max-w-xl">
    <h1 className="text-xl font-semibold">Rate / Review</h1>
    <div className="flex gap-2">
      <select value={type} onChange={e=>setType(e.target.value)} className="select">
        <option value="movie">Movie</option><option value="tv">TV</option><option value="book">Book</option><option value="game">Game</option><option value="music">Music</option>
      </select>
      <input value={externalId} onChange={e=>setExternalId(e.target.value)} placeholder="external_id (e.g., tmdb:movie:603)" className="input flex-1"/>
    </div>
    <div className="flex items-center gap-3"><input type="range" min={1} max={10} value={rating} onChange={e=>setRating(+e.target.value)} className="w-full"/><div className="w-10 text-center">{rating}</div></div>
    <textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="Write your thoughts…" className="input w-full min-h-28"/>
    <button onClick={submit} className="btn">Save</button>
  </div>)
}
