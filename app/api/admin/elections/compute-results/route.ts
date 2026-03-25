import { NextResponse } from "next/server"
import { computeResults } from "@/lib/computeResults"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const { electionId } = await req.json()

  const { results, ties } = await computeResults(electionId)

  await supabaseAdmin
    .from("election_results_snapshot")
    .delete()
    .eq("election_id", electionId)

  for (const r of results) {
    await supabaseAdmin.from("election_results_snapshot").insert({
      election_id: electionId,
      position_id: r.positionId,
      candidate_user_id: r.candidateId,
      vote_count: r.votes,
      is_tie: false,
    })
  }

  for (const t of ties) {
    for (const c of t.candidates) {
      await supabaseAdmin.from("election_results_snapshot").insert({
        election_id: electionId,
        position_id: t.positionId,
        candidate_user_id: c[0],
        vote_count: c[1],
        is_tie: true,
      })
    }
  }

  await supabaseAdmin
    .from("elections")
    .update({ president_vote_required: ties.length > 0 })
    .eq("id", electionId)

  return NextResponse.json({ ties })
}
