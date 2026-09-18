'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  if (!user) return null

  return (
    <nav className="bg-slate-800 border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <h1
            onClick={() => router.push('/dashboard')}
            className="text-2xl font-bold text-purple-400 cursor-pointer hover:text-purple-300"
          >
            SecondScreen
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-300 hover:text-white transition"
            >
              Matches
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="text-slate-300 hover:text-white transition"
            >
              Leaderboard
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition"
          >
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}