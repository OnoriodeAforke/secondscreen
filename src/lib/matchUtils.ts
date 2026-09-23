import { supabase } from './supabase'

export const updateMatchStatuses = async () => {
  try {
    // Get all upcoming matches where scheduled_at has passed
    const { data: matchesToUpdate, error: fetchError } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'upcoming')
      .lt('scheduled_at', new Date().toISOString())

    if (fetchError) throw fetchError

    if (matchesToUpdate && matchesToUpdate.length > 0) {
      const matchIds = matchesToUpdate.map((m) => m.id)

      // Update all these matches to 'live'
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'live' })
        .in('id', matchIds)

      if (updateError) throw updateError

      console.log(`Updated ${matchIds.length} matches to live`)
    }
  } catch (err) {
    console.error('Error updating match statuses:', err)
  }
}