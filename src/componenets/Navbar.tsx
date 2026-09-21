'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type Profile = {
  username: string
  points: number
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username, points')
        .eq('id', user!.id)
        .single()

      if (data) setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const isActive = (path: string) => pathname === path

  if (!user) return null

  return (
    <nav className="bg-slate-800 border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex gap-8 items-center">
          <h1
            onClick={() => router.push('/dashboard')}
            className="text-2xl font-bold text-purple-400 cursor-pointer hover:text-purple-300 transition"
          >
            SecondScreen
          </h1>

          <div className="flex gap-6">
            <button
              onClick={() => router.push('/dashboard')}
              className={`transition ${
                isActive('/dashboard')
                  ? 'text-white font-semibold border-b-2 border-purple-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className={`transition ${
                isActive('/leaderboard')
                  ? 'text-white font-semibold border-b-2 border-purple-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {profile && (
            <div className="text-right">
              <p className="text-sm text-slate-400">{profile.username}</p>
              <p className="text-lg font-bold text-purple-300">{profile.points} pts</p>
            </div>
          )}

          <button
            onClick={() => router.push('/profile')}
            className={`px-4 py-2 rounded transition ${
              isActive('/profile')
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}