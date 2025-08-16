import { NextResponse } from 'next/server'
export async function GET(req){
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q'); if(!q) return NextResponse.json({ items: [] })
  const key = process.env.GOOGLE_BOOKS_API_KEY
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${key||''}`
  const r = await fetch(url); const data = await r.json(); return NextResponse.json(data)
}
