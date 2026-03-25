// app/api/user/elections/[id]/nomination-context/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    /* -------------------------
       Extract election ID
       ------------------------- */
    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2)[0]
    const electionId = Number(id)

    if (!electionId || Number.isNaN(electionId)) {
      return NextResponse.json(
        { error: "Invalid election id" },
        { status: 400 }
      )
    }

    /* -------------------------
       Auth check
       ------------------------- */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* -------------------------
       Verify voter eligibility
       ------------------------- */
    const { data: voter } = await supabaseAdmin
      .from("voters")
      .select("id")
      .eq("election_id", electionId)
      .eq("email", user.email)
      .eq("is_active", true)
      .single()

    if (!voter) {
      return NextResponse.json(
        { error: "You are not eligible to apply for nomination" },
        { status: 403 }
      )
    }

    /* -------------------------
       Fetch verified user name
       ------------------------- */
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("name, email")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    /* -------------------------
       Final response
       ------------------------- */
    return NextResponse.json({
      name: profile.name,
      email: profile.email,
      eligible: true,
    })
  } catch (err) {
    console.error("NOMINATION CONTEXT ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
