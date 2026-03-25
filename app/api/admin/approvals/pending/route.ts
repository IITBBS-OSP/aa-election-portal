import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    /* =========================
       1. READ QUERY PARAMS
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
       2. AUTHENTICATE USER
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* =========================
       3. ROLE CHECK
       ========================= */
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || !["ADMIN", "OBSERVER"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    /* =========================
       4. FETCH PENDING APPROVAL
       (ADMIN CLIENT — BYPASSES RLS)
       ========================= */
    const { data: approval, error } = await supabaseAdmin
      .from("approval_requests")
      .select("id, action_type, payload")
      .eq("election_id", Number(electionId))
      .eq("status", "PENDING")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      console.log("Pending approval fetched:", approval, error)

    if (error) {
      console.error("Approval fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch approval request" },
        { status: 500 }
      )
    }

    /* =========================
       5. RESPONSE
       ========================= */
    return NextResponse.json({
      approval: approval ?? null,
    })
  } catch (err) {
    console.error("PENDING APPROVAL ROUTE ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
