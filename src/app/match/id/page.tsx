'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

type Match = {
  id: string
  team1: string
  team2: string
  scheduled_at: string
  status: string
}

type Prediction = {
  id: string
  predicted_winner: string
  is_correct: boolean | null
  points_earned: number
}

export default function MatchPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const matchId = params.id as string

  const [match, setMatch] = useState<Match | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [selectedWinner, setSelectedWinner] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (matchId) {
      fetchMatch()
      if (user) fetchPrediction()
    }
  }, [matchId, user])

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
    try {
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', user!.id)
        .single()

      if (data) setPrediction(data)
    } catch (err) {
      // No prediction yet, that's fine
    }
  }

  const handlePrediction = async (winner: string) => {
    if (!user) {
      router.push('/auth')
      return
    }

    setSubmitting(true)
    try {
      if (prediction) {
        // Update existing prediction
        const { error } = await supabase
          .from('predictions')
          .update({ predicted_winner: winner })
          .eq('id', prediction.id)

        if (error) throw error
      } else {
        // Create new prediction
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
      fetchPrediction()
    } catch (err) {
      console.error('Error making prediction:', err)
      alert('Failed to save prediction')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Match not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-purple-400 hover:text-purple-300"
        >
          ← Back
        </button>

        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">
            {match.team1} vs {match.team2}
          </h1>
          <p className="text-slate-400 mb-6">
            {new Date(match.scheduled_at).toLocaleString()}
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Make Your Prediction</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePrediction(match.team1)}
                disabled={submitting}
                className={`py-4 px-6 rounded-lg font-semibold transition ${
                  selectedWinner === match.team1 || prediction?.predicted_winner === match.team1
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {match.team1}
              </button>
              <button
                onClick={() => handlePrediction(match.team2)}
                disabled={submitting}
                className={`py-4 px-6 rounded-lg font-semibold transition ${
                  selectedWinner === match.team2 || prediction?.predicted_winner === match.team2
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {match.team2}
              </button>
            </div>

            {prediction && (
              <div className="mt-4 p-3 bg-purple-600/20 border border-purple-500/50 rounded text-purple-200 text-sm">
                You predicted: <strong>{prediction.predicted_winner}</strong>
                {prediction.is_correct !== null && (
                  <span className={prediction.is_correct ? ' text-green-400' : ' text-red-400'}>
                    {' '}
                    ({prediction.is_correct ? 'Correct' : 'Incorrect'}) +
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