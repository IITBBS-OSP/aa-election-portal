import { supabaseAdmin } from "./supabaseAdmin"

export async function computeResults(electionId: number) {
  const { data: votes, error } = await supabaseAdmin
    .from("votes")
    .select(`
      nomination_id,
      nominations (
        id,
        user_id,
        position_id
      )
    `)
    .eq("election_id", electionId)

  if (error) {
    throw error
  }

  /**
   * map[positionId][candidateUserId] = voteCount
   */
  const map: Record<number, Record<string, number>> = {}

  votes?.forEach(v => {
    const nominations = v.nominations
    if (!nominations || !Array.isArray(nominations)) return

    nominations.forEach(nomination => {
      const positionId = nomination.position_id
      const candidateUserId = nomination.user_id

      if (!map[positionId]) map[positionId] = {}
      map[positionId][candidateUserId] =
        (map[positionId][candidateUserId] || 0) + 1
    })
  })

  const results: {
    positionId: number
    candidateId: string
    votes: number
  }[] = []

  const ties: {
    positionId: number
    candidates: [string, number][]
    votes: number
  }[] = []

  for (const [positionId, candidates] of Object.entries(map)) {
    const sorted = Object.entries(candidates).sort(
      (a, b) => b[1] - a[1]
    )

    const maxVotes = sorted[0][1]
    const top = sorted.filter(c => c[1] === maxVotes)

    if (top.length > 1) {
      ties.push({
        positionId: Number(positionId),
        candidates: top,
        votes: maxVotes,
      })
    } else {
      results.push({
        positionId: Number(positionId),
        candidateId: sorted[0][0],
        votes: maxVotes,
      })
    }
  }

  return { results, ties }
}
