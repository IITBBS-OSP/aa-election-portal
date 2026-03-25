// app/api/admin/elections/[id]/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    /* =========================
       SAFE PARAM EXTRACTION
       ========================= */
    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()
    const electionId = Number(id)

    console.log("Fetching details for election ID:", electionId)

    if (!electionId || Number.isNaN(electionId)) {
      return NextResponse.json(
        { error: "Invalid election id" },
        { status: 400 }
      )
    }

    /* =========================
       AUTH & ROLE CHECK
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "OBSERVER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =========================
       FETCH ELECTION CORE
       ========================= */
    const { data: election, error: electionError } = await supabaseAdmin
      .from("elections")
      .select(`
        id,
        title,
        description,
        academic_year,
        status,
        created_at
      `)
      .eq("id", electionId)
      .single()

    if (electionError || !election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      )
    }

    /* =========================
       FETCH POSITIONS
       ========================= */
    const { data: positions } = await supabaseAdmin
      .from("positions")
      .select(`
        id,
        name,
        allow_multiple,
        max_selections
      `)
      .eq("election_id", electionId)

    /* =========================
       FETCH PHASES
       ========================= */
    const { data: phases } = await supabaseAdmin
      .from("election_phases")
      .select(`
        phase,
        start_date,
        end_date
      `)
      .eq("election_id", electionId)

    /* =========================
       COUNTS
       ========================= */
    const [{ count: voterCount }, { count: candidateCount }] =
      await Promise.all([
        supabaseAdmin
          .from("voters")
          .select("*", { count: "exact", head: true })
          .eq("election_id", electionId)
          .eq("is_active", true),

        supabaseAdmin
          .from("nominations")
          .select("*", { count: "exact", head: true })
          .eq("election_id", electionId)
          .eq("status", "APPROVED"),
      ])

    return NextResponse.json({
      election,
      positions: positions ?? [],
      phases: phases ?? [],
      stats: {
        totalVoters: voterCount ?? 0,
        totalPositions: positions?.length ?? 0,
        totalCandidates: candidateCount ?? 0,
      },
    })
  } catch (err) {
    console.error("FETCH ELECTION DETAILS ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
