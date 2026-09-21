'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Match = {
  id: string
  team1: string
  team2: string
  scheduled_at: string
  status: string
  result: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('scheduled_at', { ascending: false })
    setMatches(data || [])
  }

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!team1 || !team2 || !scheduledAt) {
        throw new Error('All fields are required')
      }

      const { error: insertError } = await supabase.from('matches').insert({
        team1,
        team2,
        scheduled_at: scheduledAt,
        status: 'upcoming',
      })

      if (insertError) throw insertError

      setSuccess(`Match added: ${team1} vs ${team2}`)
      setTeam1('')
      setTeam2('')
      setScheduledAt('')
      fetchMatches()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStartMatch = async (matchId: string) => {
    setError('')
    setSuccess('')
    try {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'live' })
        .eq('id', matchId)

      if (updateError) throw updateError

      setSuccess('Match is now live!')
      fetchMatches()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start match')
    }
  }

  const handleSetResult = async (matchId: string, winner: string) => {
    setError('')
    setSuccess('')
    try {
      // Set both status AND result together
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'completed', result: winner })
        .eq('id', matchId)

      if (updateError) throw updateError

      // Score predictions with the correct parameter name
      const { error: scoreError } = await supabase.rpc('score_predictions', {
        p_match_id: matchId,
      })

      if (scoreError) throw scoreError

      setSuccess(`Match scored! Winner: ${winner}`)
      fetchMatches()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score match')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Dashboard
          </button>
        </div>

        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Add Match</h2>

          <form onSubmit={handleAddMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Team 1</label>
              <input
                type="text"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                placeholder="e.g., Team Liquid"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Team 2</label>
              <input
                type="text"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                placeholder="e.g., OG"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-2 rounded font-semibold transition"
            >
              {loading ? 'Adding...' : 'Add Match'}
            </button>
          </form>
        </div>

        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Manage Matches</h2>

          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">
                    {match.team1} vs {match.team2}
                  </p>
                  <span
                    className={`text-sm px-2 py-1 rounded capitalize ${
                      match.status === 'live'
                        ? 'bg-red-600'
                        : match.status === 'completed'
                        ? 'bg-green-700'
                        : 'bg-slate-600'
                    }`}
                  >
                    {match.status}
                  </span>
                </div>

                {match.status === 'completed' ? (
                  <p className="text-green-400 text-sm">Winner: {match.result}</p>
                ) : match.status === 'upcoming' ? (
                  <button
                    onClick={() => handleStartMatch(match.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm mt-2"
                  >
                    Start Match (Go Live)
                  </button>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSetResult(match.id, match.team1)}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                    >
                      {match.team1} wins
                    </button>
                    <button
                      onClick={() => handleSetResult(match.id, match.team2)}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                    >
                      {match.team2} wins
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}