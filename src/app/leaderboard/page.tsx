'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type LeaderboardUser = {
  id: string
  username: string
  points: number
  prediction_streak: number
}

export default function Leaderboard() {
  const router = useRouter()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, points, prediction_streak')
        .order('points', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Leaderboard</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Dashboard
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading leaderboard...</p>
        ) : users.length === 0 ? (
          <p className="text-slate-400">No users yet.</p>
        ) : (
          <div className="bg-slate-800 border border-purple-500/20 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-700 font-semibold border-b border-purple-500/20">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-3">Points</div>
              <div className="col-span-3">Streak</div>
            </div>

            {users.map((user, index) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700 hover:bg-slate-700/50 transition"
              >
                <div className="col-span-1 font-bold">#{index + 1}</div>
                <div className="col-span-5">{user.username}</div>
                <div className="col-span-3 text-purple-300 font-semibold">{user.points}</div>
                <div className="col-span-3">{user.prediction_streak}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}