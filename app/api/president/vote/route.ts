// app/api/president/vote/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

export async function POST(req: Request) {
  try {
    const { token, votes } = await req.json()

    if (!token || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      )
    }

    /* ================= AUTHENTICATE USER ================= */
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    /* ================= VERIFY PRESIDENT ROLE ================= */
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "PRESIDENT") {
      return NextResponse.json(
        { error: "Only president can vote" },
        { status: 403 }
      )
    }

    /* ================= VALIDATE TOKEN ================= */
    const { data: tokenRow } = await supabaseAdmin
      .from("president_vote_tokens")
      .select("id, election_id")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    /* ================= PROCESS EACH VOTE ================= */
    for (const vote of votes) {

      /* Fetch nomination ID */
      const { data: nomination } = await supabaseAdmin
        .from("nominations")
        .select("id")
        .eq("election_id", tokenRow.election_id)
        .eq("position_id", vote.positionId)
        .eq("user_id", vote.candidateUserId)
        .single()

      if (!nomination) {
        return NextResponse.json(
          { error: "Invalid candidate selected" },
          { status: 400 }
        )
      }

      /* Prevent duplicate vote for same position */
      const { data: existing } = await supabaseAdmin
        .from("president_votes")
        .select("id")
        .eq("election_id", tokenRow.election_id)
        .eq("position_id", vote.positionId)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: "Vote already recorded for this position" },
          { status: 400 }
        )
      }

      /* Insert president vote */
      const { error } = await supabaseAdmin
        .from("president_votes")
        .insert({
          election_id: tokenRow.election_id,
          position_id: vote.positionId,
          nomination_id: nomination.id,
          voted_by: user.id
        })

      if (error) throw error
    }

    /* ================= MARK TOKEN USED ================= */
    await supabaseAdmin
      .from("president_vote_tokens")
      .update({ used: true })
      .eq("id", tokenRow.id)

    /* ================= UPDATE ELECTION FLAGS ================= */
    await supabaseAdmin
      .from("elections")
      .update({
        president_vote_completed: true,
      })
      .eq("id", tokenRow.election_id)

    /* ================= OPTIONAL: RECOMPUTE SNAPSHOT ================= */
    await supabaseAdmin.rpc("compute_and_snapshot_results", {
      p_election_id: tokenRow.election_id
    })

    return NextResponse.json({
      status: "PRESIDENT_VOTE_COMPLETED"
    })

  } catch (err) {
    console.error("PRESIDENT VOTE ERROR:", err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}




function unwrapRelation<T>(
  rel: T | T[] | null | undefined
): T | undefined {
  if (!rel) return undefined
  return Array.isArray(rel) ? rel[0] : rel
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token missing" },
        { status: 400 }
      )
    }

    /* ================= VALIDATE TOKEN ================= */
    const { data: tokenRow, error: tokenError } =
      await supabaseAdmin
        .from("president_vote_tokens")
        .select("election_id")
        .eq("token", token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single()

    if (tokenError || !tokenRow) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    /* ================= FETCH TIED SNAPSHOT ================= */
    const { data, error } = await supabaseAdmin
      .from("election_results_snapshot")
      .select(`
        candidate_user_id,
        position_id,
        users:candidate_user_id ( id, name ),
        positions:position_id ( name )
      `)
      .eq("election_id", tokenRow.election_id)
      .eq("is_tie", true)

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No active ties" },
        { status: 400 }
      )
    }

    /* ================= GROUP BY POSITION ================= */
    const grouped: Record<number, any> = {}

    for (const row of data) {
      const position = unwrapRelation(row.positions)
      const user = unwrapRelation(row.users)

      if (!grouped[row.position_id]) {
        grouped[row.position_id] = {
          positionId: row.position_id,
          positionName: position?.name ?? "Unknown",
          candidates: [],
        }
      }

      grouped[row.position_id].candidates.push({
        candidateUserId: row.candidate_user_id,
        name: user?.name ?? "Candidate",
      })
    }

    return NextResponse.json({
      positions: Object.values(grouped),
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}