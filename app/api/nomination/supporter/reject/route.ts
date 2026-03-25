// app/api/nomination/supporter/reject/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const { token } = await req.json()

  const { data } = await supabaseAdmin
    .from("nomination_supporter_tokens")
    .select("nomination_id")
    .eq("token", token)
    .single()

  if (!data) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  }

  await supabaseAdmin
    .from("nominations")
    .update({ status: "REJECTED" })
    .eq("id", data.nomination_id)

  return NextResponse.json({ status: "REJECTED" })
}
