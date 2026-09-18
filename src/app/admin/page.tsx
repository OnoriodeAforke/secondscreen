'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        scheduled_at: new Date(scheduledAt).toISOString(),
        status: 'upcoming',
      })

      if (insertError) throw insertError

      setSuccess(`Match added: ${team1} vs ${team2}`)
      setTeam1('')
      setTeam2('')
      setScheduledAt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
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

        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8">
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
      </div>
    </div>
  )
}