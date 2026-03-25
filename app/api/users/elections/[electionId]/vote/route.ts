// app/api/user/elections/[electionId]/vote/route.ts
import { NextResponse,NextRequest } from "next/server"
import crypto from "crypto"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"


export async function POST(
 req: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    /* =========================
       1. AUTH CHECK
       ========================= */
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

     const url = new URL(req.url)
    const parts = url.pathname.split("/")
    const electionId = Number(parts[parts.length - 2])
    // console.log("Election ID:", electionId)

    if (Number.isNaN(electionId)) {
      
      return NextResponse.json({ error: "Invalid electionId" }, { status: 400 })
    }

    const userEmail = user.email.toLowerCase()

    /* =========================
       2. ELIGIBILITY CHECK
       ========================= */
    const { data: voter } = await supabase
      .from("voters")
      .select("id")
      .eq("election_id", electionId)
      .eq("email", userEmail)
      .eq("is_active", true)
      .maybeSingle()

    if (!voter) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =========================
       3. CHECK ELECTION STATUS
       ========================= */
    const { data: election } = await supabase
      .from("elections")
      .select("status")
      .eq("id", electionId)
      .single()

    if (!election || election.status !== "VOTING") {
      return NextResponse.json(
        { error: "Voting is not active" },
        { status: 400 }
      )
    }

    /* =========================
       4. CHECK IF USER ALREADY VOTED
       ========================= */
    const hashedVoterId = crypto
      .createHash("sha256")
      .update(user.id + electionId)
      .digest("hex")

    const { data: submitted } = await supabaseAdmin
      .from("vote_submissions")
      .select("id")
      .eq("election_id", electionId)
      .eq("hashed_voter_id", hashedVoterId)
      .maybeSingle()

    if (submitted) {
      return NextResponse.json(
        { error: "You have already voted" },
        { status: 409 }
      )
    }

    /* =========================
       5. READ & VALIDATE VOTES
       ========================= */
    const body = await req.json()
    const votesInput = body.votes
    console.log("Votes Input:", votesInput)

    if (!votesInput || typeof votesInput !== "object") {
      return NextResponse.json(
        { error: "Invalid vote payload" },
        { status: 400 }
      )
    }

    /* =========================
       6. FETCH POSITIONS RULES
       ========================= */
    const positionIds = Object.keys(votesInput).map(Number)

    const { data: positions } = await supabaseAdmin
      .from("positions")
      .select("id, allow_multiple, max_selections")
      .in("id", positionIds)

    const positionMap = new Map(
      positions?.map(p => [p.id, p]) || []
    )

    // console.log("Position IDs requested:", positionIds)
// console.log("Positions fetched from DB:", positions)

    /* =========================
       7. BUILD VOTE ROWS
       ========================= */
    const voteRows: any[] = []

    for (const [positionIdStr, candidateIds] of Object.entries(votesInput)) {
      const positionId = Number(positionIdStr)
      const rule = positionMap.get(positionId)

      


      if (!rule) {
        return NextResponse.json(
          { error: `Invalid position ${positionId}` },
          { status: 400 }
        )
      }

      if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
        return NextResponse.json(
          { error: `No vote selected for position ${positionId}` },
          { status: 400 }
        )
      }

      if (!rule.allow_multiple && candidateIds.length > 1) {
        return NextResponse.json(
          { error: `Multiple votes not allowed for position ${positionId}` },
          { status: 400 }
        )
      }

      if (
        rule.allow_multiple &&
        rule.max_selections &&
        candidateIds.length > rule.max_selections
      ) {
        return NextResponse.json(
          { error: `Max ${rule.max_selections} selections allowed for position ${positionId}` },
          { status: 400 }
        )
      }

      voteRows.push({
  election_id: electionId,
  position_id: positionId,
  hashed_voter_id: hashedVoterId,
  candidate_ids: candidateIds, 
})

    }

    /* =========================
       8. INSERT VOTES ATOMICALLY
       ========================= */
     const { error: voteError } = await supabaseAdmin
  .from("votes")
  .insert(voteRows)

if (voteError) {
  console.error("VOTES INSERT ERROR:", voteError)
  return NextResponse.json(
    { error: "Failed to store votes" },
    { status: 500 }
  )
}


    await supabaseAdmin.from("vote_submissions").insert({
      election_id: electionId,
      hashed_voter_id: hashedVoterId,
    })

    return NextResponse.json({ status: "VOTE_CAST_SUCCESS" })
  } catch (err) {
    console.error("VOTE CAST ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
