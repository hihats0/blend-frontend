export const mentionRegex = /@([a-zA-Z0-9_]{2,20})/g
export function extractMentions(text=''){ const s=new Set(); for(const m of text.matchAll(mentionRegex)) s.add(m[1]); return [...s] }
