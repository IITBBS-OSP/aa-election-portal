// app/api/admin/elections/meta/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const electionId = Number(url.searchParams.get("electionId"))

  if (Number.isNaN(electionId)) {
    return NextResponse.json({ error: "Invalid electionId" }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

const { data } = await supabaseAdmin
  .from("elections")
  .select("president_vote_required, president_vote_completed")
  .eq("id", electionId)
  .single()
    // console.log("Election meta data:", data)

  return NextResponse.json({
    president_vote_required: Boolean(data?.president_vote_required),
    president_vote_completed: Boolean(data?.president_vote_completed),
  })
}
