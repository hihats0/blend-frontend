import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { extractMentions } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req){
  const supabaseServer = createServerClient()
  const token = req.headers.get('Authorization')?.split(' ')[1]
  if(!token){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
  if(authError || !user){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { content, kind = 'text', media_url = null } = await req.json()
  const { error } = await supabaseServer.from('posts').insert({ user_id: user.id, kind, content, media_url })
  if(error){
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  const names = extractMentions(content)
  if(names.length){
    const { data: profs } = await supabaseServer.from('profiles').select('id,username').in('username', names)
    const notif = (profs||[]).map(p => ({ user_id: p.id, type: 'mention', payload: {} }))
    if(notif.length){
      await supabaseServer.from('notifications').insert(notif)
    }
  }
  return NextResponse.json({ status: 'ok' })
}
