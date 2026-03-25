// app/api/nomination/supporter/validate/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("nomination_supporter_tokens")
    .select(`
      id,
      role,
      email,
      approved_at,
      expires_at,
      nomination_id,
      nomination_id (
        id,
        name,
        election_id,
        positions (
          name
        )
      )
    `)
    .eq("token", token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  }

  if (data.approved_at) {
    return NextResponse.json({ error: "Already approved" }, { status: 409 })
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }

  return NextResponse.json({
    nominationId: data.nomination_id?.id,
    candidateName: data.nomination_id?.name,
    positionName: data.nomination_id?.positions?.name,
    role: data.role,
  })
}
