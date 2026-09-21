'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type Match = {
  id: string
  team1: string
  team2: string
  scheduled_at: string
  status: string
  result: string | null
}

type Prediction = {
  id: string
  predicted_winner: string
  is_correct: boolean | null
  points_earned: number
}

export default function MatchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const matchId = params?.id as string

  const [match, setMatch] = useState<Match | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [selectedWinner, setSelectedWinner] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (matchId && !authLoading) {
      fetchMatch()
      if (user) fetchPrediction()
    }
  }, [matchId, user, authLoading])

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (error) throw error
      setMatch(data)
    } catch (err) {
      console.error('Error fetching match:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrediction = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) setPrediction(data)
    } catch (err) {
      console.error('Error fetching prediction:', err)
    }
  }

  const handlePrediction = async (winner: string) => {
    if (!user || !match || match.status !== 'upcoming') return

    setSubmitting(true)
    try {
      if (prediction) {
        const { error } = await supabase
          .from('predictions')
          .update({ predicted_winner: winner })
          .eq('id', prediction.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('predictions')
          .insert({
            user_id: user.id,
            match_id: matchId,
            predicted_winner: winner,
          })

        if (error) throw error
      }

      setSelectedWinner(winner)
      await fetchPrediction()
    } catch (err) {
      console.error('Error making prediction:', err)
      alert('Failed to save prediction')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Match not found</p>
      </div>
    )
  }

  const predictionsDisabled = match.status !== 'upcoming'

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="mb-6 text-purple-400 hover:text-purple-300 inline-block"
        >
          ← Back
        </Link>

        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {match.team1} vs {match.team2}
            </h1>
            {match.status === 'live' && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                ● LIVE
              </span>
            )}
          </div>
          <p className="text-slate-400 mb-6">
            {new Date(match.scheduled_at).toLocaleString()}
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {match.status === 'completed' ? 'Final Result' : 'Make Your Prediction'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePrediction(match.team1)}
                disabled={submitting || predictionsDisabled}
                className={`py-4 px-6 rounded-lg font-semibold transition ${
                  selectedWinner === match.team1 || prediction?.predicted_winner === match.team1
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                } ${
                  match.status === 'completed' && match.result === match.team1
                    ? 'ring-2 ring-green-400'
                    : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {match.team1}
              </button>
              <button
                onClick={() => handlePrediction(match.team2)}
                disabled={submitting || predictionsDisabled}
                className={`py-4 px-6 rounded-lg font-semibold transition ${
                  selectedWinner === match.team2 || prediction?.predicted_winner === match.team2
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                } ${
                  match.status === 'completed' && match.result === match.team2
                    ? 'ring-2 ring-green-400'
                    : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {match.team2}
              </button>
            </div>

            {match.status === 'live' && (
              <p className="text-red-400 text-sm mt-3">
                Predictions are locked — this match is live.
              </p>
            )}

            {prediction && (
              <div className="mt-4 p-3 bg-purple-600/20 border border-purple-500/50 rounded text-purple-200 text-sm">
                You predicted: <strong>{prediction.predicted_winner}</strong>
                {match.status === 'completed' && prediction.is_correct !== null && (
                  <span className={prediction.is_correct ? ' text-green-400' : ' text-red-400'}>
                    {' '}
                    ({prediction.is_correct ? 'Correct! 🎉' : 'Incorrect'}) +
                    {prediction.points_earned} pts
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-slate-400 text-sm">
            Status: <span className="capitalize font-semibold">{match.status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}