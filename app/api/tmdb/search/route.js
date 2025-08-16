import { NextResponse } from 'next/server'
export async function GET(req){
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q'); const type = searchParams.get('type') || 'movie'
  if(!q) return NextResponse.json({ results: [] })
  const key = process.env.TMDB_API_KEY
  const endpoint = type==='tv'? 'search/tv' : 'search/movie'
  const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${key}&query=${encodeURIComponent(q)}`
  const r = await fetch(url); const data = await r.json(); return NextResponse.json(data)
}
