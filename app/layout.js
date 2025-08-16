import './globals.css'
import SidebarLeft from '@/components/SidebarLeft'
import RightRail from '@/components/RightRail'
import Navbar from '@/components/Navbar' // mobil alt bar

export const metadata = { title: 'Blend', description: 'Twitter-like UI' }

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 min-h-screen grid grid-cols-12 gap-4">
          <aside className="hidden md:block md:col-span-3 lg:col-span-3 xl:col-span-3 py-4">
            <SidebarLeft />
          </aside>
          <main className="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-6 py-4">
            {children}
            <div className="h-28" />
          </main>
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 py-4">
            <RightRail />
          </aside>
        </div>
        <div className="md:hidden">
          <Navbar />
        </div>
      </body>
    </html>
  )
}
