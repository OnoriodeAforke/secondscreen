'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type Profile = {
  username: string
  points: number
  prediction_streak: number
  correct_predictions: number
  total_predictions: number
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-slate-900" />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Profile</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Dashboard
          </button>
        </div>

        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8">
          {profile && (
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm">Username</p>
                <p className="text-2xl font-bold">{profile.username}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-400 text-sm">Total Points</p>
                  <p className="text-3xl font-bold text-purple-300">{profile.points}</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-400 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold text-purple-300">{profile.prediction_streak}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-400 text-sm">Correct Predictions</p>
                  <p className="text-2xl font-bold">{profile.correct_predictions}</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-400 text-sm">Total Predictions</p>
                  <p className="text-2xl font-bold">{profile.total_predictions}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-semibold transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}