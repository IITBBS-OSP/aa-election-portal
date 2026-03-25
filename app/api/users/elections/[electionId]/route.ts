// app/api/user/elections/[id]/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    /* =========================
       EXTRACT ELECTION ID
       ========================= */
    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()
    const electionId = Number(id)

    if (!electionId || Number.isNaN(electionId)) {
      return NextResponse.json(
        { error: "Invalid election id" },
        { status: 400 }
      )
    }

    /* =========================
       AUTH CHECK
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = user.email.toLowerCase()

    /* =========================
       ROLE CHECK (ADMIN / OBSERVER)
       ========================= */
    const { data: userProfile, error: roleError } =
      await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (roleError) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isPrivileged =
      userProfile.role === "ADMIN" ||
      userProfile.role === "OBSERVER"

    /* =========================
       ELIGIBILITY CHECK (ONLY FOR NON-PRIVILEGED)
       ========================= */
    if (!isPrivileged) {
      const { data: voter } = await supabaseAdmin
        .from("voters")
        .select("id")
        .eq("election_id", electionId)
        .eq("email", userEmail)
        .eq("is_active", true)
        .maybeSingle()

      if (!voter) {
        return NextResponse.json(
          { error: "You are not eligible for this election" },
          { status: 403 }
        )
      }
    }

    /* =========================
       FETCH ELECTION CORE
       ========================= */
    const { data: election } = await supabaseAdmin
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

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      )
    }

    /* =========================
       FETCH PHASE DATES
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
       FINAL RESPONSE
       ========================= */
    return NextResponse.json({
      election,
      phases: phases ?? [],
      positions: positions ?? [],
    })
  } catch (err) {
    console.error("USER ELECTION DETAILS ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
