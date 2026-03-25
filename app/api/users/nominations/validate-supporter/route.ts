// app/api/user/nominations/validate-supporter/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { electionId, email } = await req.json()

    if (!electionId || !email) {
      return NextResponse.json(
        { error: "electionId and email are required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    const { data: voter } = await supabase
      .from("voters")
      .select("id")
      .eq("election_id", electionId)
      .eq("email", normalizedEmail)
      .eq("is_active", true)
      .maybeSingle()

    return NextResponse.json({
      valid: Boolean(voter),
    })
  } catch (err) {
    console.error("VALIDATE SUPPORTER ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
