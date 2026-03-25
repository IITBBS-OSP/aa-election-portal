// app/api/admin/nominations/decision/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { nominationId, decision, remarks } = await req.json()

    if (!nominationId || !["APPROVE", "REJECT"].includes(decision)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Prevent duplicate pending approval
    const { data: pending } = await supabaseAdmin
      .from("approval_requests")
      .select("id")
      .eq("entity_id", nominationId.toString())
      .eq("action_type", "NOMINATION_DECISION")
      .eq("status", "PENDING_ADMIN_REVIEW")
      .maybeSingle()

    if (pending) {
      return NextResponse.json(
        { error: "Decision already pending observer approval" },
        { status: 409 }
      )
    }


    const { data: nomination, error: nominationError } = await supabaseAdmin
  .from("nominations")
  .select("election_id")
  .eq("id", nominationId)
  .single()

if (nominationError || !nomination) {
  return NextResponse.json(
    { error: "Invalid nomination ID" },
    { status: 400 }
  )
}

const electionId = nomination.election_id

 const { data: inserted, error: insertError } = await supabaseAdmin
  .from("approval_requests")
  .insert({
    election_id: electionId,            // ✅ INT
    action_type: "NOMINATION_DECISION",
    payload: {
      nomination_id: nominationId,      // keep UUID here
      decision,
      remarks,
    },
    requested_by: user.id,
    status: "PENDING",
  })
  .select()
  .single()


if (insertError) {
  console.error("INSERT ERROR:", insertError)
  return NextResponse.json(
    { error: insertError.message },
    { status: 500 }
  )
}

    return NextResponse.json({ status: "PENDING_APPROVAL" })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
