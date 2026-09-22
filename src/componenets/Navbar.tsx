'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const linkClass = (path: string) =>
    `px-3 py-2 rounded transition ${
      pathname === path
        ? 'bg-purple-600 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`

  return (
    <nav className="bg-slate-800 border-b border-purple-500/20 px-4 py-3">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          SecondScreen
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/leaderboard" className={linkClass('/leaderboard')}>
            Leaderboard
          </Link>
          <Link href="/profile" className={linkClass('/profile')}>
            Profile
          </Link>
          {user && (
            <button
              onClick={handleSignOut}
              className="ml-2 text-slate-400 hover:text-white px-3 py-2 rounded transition"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}