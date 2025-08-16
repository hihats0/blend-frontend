export const mentionRegex = /@([a-zA-Z0-9_]+)/g
export function extractMentions(text=''){
  const set = new Set()
  let m; while((m = mentionRegex.exec(text))!==null){ set.add(m[1]) }
  return Array.from(set)
}
