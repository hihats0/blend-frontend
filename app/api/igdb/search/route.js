import { NextResponse } from 'next/server'
export async function GET(req){
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q'); if(!q) return NextResponse.json([])
  const client = process.env.TWITCH_CLIENT_ID; const secret = process.env.TWITCH_CLIENT_SECRET
  const tr = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${client}&client_secret=${secret}&grant_type=client_credentials`, { method: 'POST' })
  const tdata = await tr.json(); const token = tdata.access_token
  const gr = await fetch('https://api.igdb.com/v4/games', { method: 'POST', headers: { 'Client-ID': client, 'Authorization': `Bearer ${token}` }, body: `search "${q}"; fields id,name,first_release_date,cover.*; limit 10;` })
  const data = await gr.json(); return NextResponse.json(data)
}
