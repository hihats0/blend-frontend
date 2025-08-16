import './globals.css'
import Navbar from '@/components/Navbar'
export const metadata = { title: 'Blend', description: 'Minimal black+gold social app' }
export default function RootLayout({ children }){
  return (
    <html lang="en"><body>
      <main className="container pb-24 pt-6">{children}</main>
      <Navbar /></body></html>
  )
}
