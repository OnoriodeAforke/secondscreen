'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

type Poll = {
  id: string
  question: string
  options: string[]
  is_active: boolean
  created_at: string
}

type VoteCount = {
  [option: string]: number
}

export function PollDisplay({ matchId }: { matchId?: string }) {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: string }>({})
  const [voteCounts, setVoteCounts] = useState<{ [pollId: string]: VoteCount }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPolls()
    const interval = setInterval(fetchPolls, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPolls = async () => {
    try {
      let query = supabase.from('polls').select('*').eq('is_active', true)

      if (matchId) {
        query = query.eq('match_id', matchId)
      }

      const { data: pollData } = await query

      if (pollData) {
        setPolls(pollData)

        // Fetch vote counts for each poll
        for (const poll of pollData) {
          fetchVoteCounts(poll.id)
        }

        // Fetch user's votes
        if (user) {
          fetchUserVotes(pollData.map((p) => p.id))
        }
      }
    } catch (err) {
      console.error('Error fetching polls:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVoteCounts = async (pollId: string) => {
    try {
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('selected_option')
        .eq('poll_id', pollId)

      if (votes) {
        const counts: VoteCount = {}
        votes.forEach((vote) => {
          counts[vote.selected_option] = (counts[vote.selected_option] || 0) + 1
        })
        setVoteCounts((prev) => ({ ...prev, [pollId]: counts }))
      }
    } catch (err) {
      console.error('Error fetching vote counts:', err)
    }
  }

  const fetchUserVotes = async (pollIds: string[]) => {
    try {
      const { data: userVoteData } = await supabase
        .from('poll_votes')
        .select('poll_id, selected_option')
        .eq('user_id', user!.id)
        .in('poll_id', pollIds)

      if (userVoteData) {
        const votes: { [key: string]: string } = {}
        userVoteData.forEach((vote) => {
          votes[vote.poll_id] = vote.selected_option
        })
        setUserVotes(votes)
      }
    } catch (err) {
      console.error('Error fetching user votes:', err)
    }
  }

  const handleVote = async (pollId: string, option: string) => {
    if (!user) return

    try {
      await supabase.from('poll_votes').insert({
        poll_id: pollId,
        user_id: user.id,
        selected_option: option,
      })

      setUserVotes((prev) => ({ ...prev, [pollId]: option }))
      await fetchVoteCounts(pollId)
    } catch (err) {
      console.error('Error voting:', err)
      alert('Failed to vote')
    }
  }

  if (loading) return null
  if (polls.length === 0) return null

  return (
    <div className="space-y-6">
      {polls.map((poll) => {
        const counts = voteCounts[poll.id] || {}
        const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0)
        const userVote = userVotes[poll.id]

        return (
          <div key={poll.id} className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                ● LIVE POLL
              </span>
              <h3 className="text-lg font-bold">{poll.question}</h3>
            </div>

            <div className="space-y-3 mb-4">
              {poll.options.map((option) => {
                const count = counts[option] || 0
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                const isUserVote = userVote === option

                return (
                  <button
                    key={option}
                    onClick={() => handleVote(poll.id, option)}
                    disabled={!!userVote}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      isUserVote
                        ? 'bg-purple-600 border-purple-400'
                        : userVote
                        ? 'bg-slate-700 border-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-slate-700 border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      <span className="text-sm font-semibold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1 mt-2">
                      <div
                        className="bg-purple-500 h-1 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-slate-400 text-sm">{totalVotes} total votes</p>
          </div>
        )
      })}
    </div>
  )
}