// app/api/user/elections/[id]/validate-voter/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    /* -------------------------
       Extract election ID
       ------------------------- */
    const url = new URL(req.url)
    const parts = url.pathname.split("/")
    const electionId = Number(parts[parts.length - 2])

    const email = url.searchParams.get("email")?.toLowerCase()

    if (!electionId || Number.isNaN(electionId) || !email) {
      return NextResponse.json(
        { valid: false },
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

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    /* -------------------------
       Validate voter
       ------------------------- */
    const { data: voter } = await supabaseAdmin
      .from("voters")
      .select("email")
      .eq("election_id", electionId)
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (!voter) {
      return NextResponse.json({ valid: false })
    }

    /* -------------------------
       Fetch voter name (optional UX)
       ------------------------- */
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("name")
      .eq("email", email)
      .single()

    return NextResponse.json({
      valid: true,
      name: userProfile?.name ?? null,
    })
  } catch (err) {
    console.error("VALIDATE VOTER ERROR:", err)
    return NextResponse.json({ valid: false })
  }
}
