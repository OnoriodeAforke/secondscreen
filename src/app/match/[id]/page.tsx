'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type Match = {
  id: string
  team1: string
  team2: string
  scheduled_at: string
  status: string
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchMatches()
    }
  }, [user])

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      setMatches(data || [])
    } catch (err) {
      console.error('Error fetching matches:', err)
    } finally {
      setLoadingMatches(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">SecondScreen</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
            >
              Leaderboard
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
            >
              Profile
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Upcoming Matches</h2>

        {loadingMatches ? (
          <p className="text-slate-400">Loading matches...</p>
        ) : matches.length === 0 ? (
          <p className="text-slate-400">No matches scheduled yet.</p>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-slate-800 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition cursor-pointer"
                onClick={() => router.push(`/match/${match.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {match.team1} vs {match.team2}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {new Date(match.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded text-sm capitalize">
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}