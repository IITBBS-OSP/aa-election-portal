// app/api/admin/elections/update-details/route.ts
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
       2. PARSE FORM DATA
       ========================= */
    const formData = await req.formData()
    const electionId = Number(formData.get("electionId"))

    if (!electionId) {
      return NextResponse.json(
        { error: "Election ID is required" },
        { status: 400 }
      )
    }

    /* =========================
       3. PREVENT DUPLICATE PENDING REQUESTS
       ========================= */
    const { data: existing } = await supabaseAdmin
      .from("approval_requests")
      .select("id")
      .eq("election_id", electionId)
      .eq("action_type", "EDIT_ELECTION")
      .eq("status", "PENDING")
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Edit already pending observer approval" },
        { status: 409 }
      )
    }

    /* =========================
       4. BUILD PAYLOAD
       ========================= */
    const payload: any = {
      title: formData.get("title"),
      academicYear: formData.get("academicYear"),
      description: formData.get("description"),
      positions: JSON.parse(formData.get("positions") as string),
      phases: JSON.parse(formData.get("phases") as string),
    }

    /* =========================
       5. HANDLE OPTIONAL VOTER FILE
       ========================= */
    const voterFile = formData.get("voterFile") as File | null

    if (voterFile) {
      const text = await voterFile.text()

      const emails = text
        .split(/\r?\n/)
        .flatMap(line => line.split(/[,;]/))
        .map(e => e.trim().toLowerCase())
        .filter(e => e && e.includes("@") && e !== "email")

      payload.newVoters = Array.from(new Set(emails))
    }

    /* =========================
       6. CREATE APPROVAL REQUEST
       ========================= */
    await supabaseAdmin.from("approval_requests").insert({
      election_id: electionId,
      action_type: "EDIT_ELECTION",
      payload,
      requested_by: user.id,
    })
/* =========================
   6.1 NOTIFY OBSERVER (EMAIL)
   ========================= */
const { data: observer, error: observerError } = await supabaseAdmin
  .from("users")
  .select("email, name")
  .eq("role", "OBSERVER")
  .single()

if (observerError || !observer) {
  console.error("Observer not found for edit election notification")
} else {
  await sendMail({
    to: observer.email,
    subject: "Approval Required: Election Details Update",
    html: `
      <p>Hello ${observer.name || "Observer"},</p>

      <p>An admin has requested to <strong>edit election details</strong>.</p>

      <p><strong>Election ID:</strong> ${electionId}</p>

      <p>This request may include:</p>
      <ul>
        <li>Title / Description changes</li>
        <li>Position updates</li>
        <li>Phase modifications</li>
        <li>Voter list changes</li>
      </ul>

      <p>Please log in to the observer dashboard to review and approve or reject this request.</p>

      <p>— IIT BBS Elections System</p>
    `,
  })
}

    /* =========================
       7. AUDIT LOG
       ========================= */
    await supabaseAdmin.from("audit_logs").insert({
      action: "REQUEST_EDIT_ELECTION",
      entity_type: "ELECTION",
      entity_id: electionId.toString(),
      performed_by: user.id,
    })

    return NextResponse.json({ status: "PENDING_APPROVAL" })
  } catch (err) {
    console.error("EDIT ELECTION REQUEST ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
