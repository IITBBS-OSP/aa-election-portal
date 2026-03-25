import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    /* =========================
       QUERY PARAM
       ========================= */
    const { searchParams } = new URL(req.url)
    const electionId = searchParams.get("electionId")

    if (!electionId) {
      return NextResponse.json(
        { error: "electionId is required" },
        { status: 400 }
      )
    }

    /* =========================
       AUTH
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

    if (!profile || !["ADMIN", "OBSERVER"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =========================
       FETCH ALL NOMINATIONS
       ========================= */
    const { data, error } = await supabaseAdmin
      .from("nominations")
      .select(`
        id,
        election_id,
        status,
        workflow_status,
        graduation_year,
        department,
        candidate_image_url,
        sop_file_url,
        created_at,
        reviewed_at,

        candidate:users!nominations_user_id_fkey (
          id,
          name,
          email
        ),

        reviewer:users!nominations_reviewed_by_fkey (
          id,
          name
        ),

        position:positions (
          id,
          name
        )
      `)
      .eq("status", "PENDING_ADMIN_REVIEW")
      .eq("election_id", Number(electionId))
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Fetch nominations error:", error)
      return NextResponse.json(
        { error: "Failed to fetch nominations" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      nominations: data ?? [],
    })
  } catch (err) {
    console.error("NOMINATIONS ROUTE ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
