import { NextResponse } from 'next/server'
export async function POST(){
  const cid = process.env.SPOTIFY_CLIENT_ID; const sec = process.env.SPOTIFY_CLIENT_SECRET
  const body = new URLSearchParams({ grant_type: 'client_credentials' })
  const r = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { 'Authorization': 'Basic ' + Buffer.from(`${cid}:${sec}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  const data = await r.json(); return NextResponse.json(data)
}
