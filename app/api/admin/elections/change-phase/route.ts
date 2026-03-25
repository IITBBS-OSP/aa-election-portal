// app/api/admin/elections/change-phase/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { sendMail } from "@/lib/mailer"


export async function POST(req: Request) {
  try {
    /* =========================
       1. AUTH & ROLE CHECK
       ========================= */
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

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =========================
       2. READ BODY
       ========================= */
    const body = await req.json()
    const { electionId, newPhase } = body

    if (!electionId || !newPhase) {
      return NextResponse.json(
        { error: "electionId and newPhase are required" },
        { status: 400 }
      )
    }

    /* =========================
       3. PREVENT MULTIPLE PENDING REQUESTS
       ========================= */
    const { data: pending } = await supabaseAdmin
      .from("approval_requests")
      .select("id")
      .eq("election_id", electionId)
      .eq("action_type", "CHANGE_PHASE")
      .eq("status", "PENDING")
      .maybeSingle()

    if (pending) {
      return NextResponse.json(
        { error: "Phase update already pending approval" },
        { status: 409 }
      )
    }

    /* =========================
       4. CREATE APPROVAL REQUEST
       ========================= */
    await supabaseAdmin.from("approval_requests").insert({
      election_id: electionId,
      action_type: "CHANGE_PHASE",
      payload: {
        newPhase,
      },
      requested_by: user.id,
    })


    /* =========================
   4.1 FETCH OBSERVER
   ========================= */
const { data: observer, error: observerError } = await supabaseAdmin
  .from("users")
  .select("email, name")
  .eq("role", "OBSERVER")
  .single()

if (observerError || !observer) {
  console.error("Observer not found for notification")
} else {
  await sendMail({
    to: observer.email,
    subject: "Approval Required: Election Phase Change",
    html: `
      <p>Hello ${observer.name || "Observer"},</p>

      <p>An admin has requested a <strong>phase change</strong> for an election.</p>

      <p><strong>Election ID:</strong> ${electionId}</p>
      <p><strong>Requested New Phase:</strong> ${newPhase}</p>

      <p>Please log in to the observer dashboard to approve or reject this request.</p>

      <p>— IIT BBS Elections System</p>
    `,
  })
}


    /* =========================
       5. AUDIT LOG
       ========================= */
    await supabaseAdmin.from("audit_logs").insert({
      action: "REQUEST_CHANGE_PHASE",
      entity_type: "ELECTION",
      entity_id: electionId.toString(),
      performed_by: user.id,
      metadata: { newPhase },
    })

    return NextResponse.json({ status: "PENDING_APPROVAL" })
  } catch (err) {
    console.error("CHANGE PHASE REQUEST ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
