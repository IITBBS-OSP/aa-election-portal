// app/api/admin/approvals/approve/route.ts
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "OBSERVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =========================
       2. READ REQUEST BODY
       ========================= */
    const body = await req.json()
    const { approvalRequestId } = body
console.log("Approval Request ID:", approvalRequestId)
    if (!approvalRequestId) {
      console.error("Approval Request ID missing in request body")
      return NextResponse.json(
        { error: "approvalRequestId is required" },
        { status: 400 }
      )
    }

    /* =========================
       3. FETCH APPROVAL REQUEST
       ========================= */
    const { data: approval, error } = await supabaseAdmin
      .from("approval_requests")
      .select("*")
      .eq("id", approvalRequestId)
      .eq("status", "PENDING")
      .single()

    if (error || !approval) {
      return NextResponse.json(
        { error: "Approval request not found or already processed" },
        { status: 404 }
      )
    }

    /* =========================
       4. HANDLE APPROVAL TYPES
       ========================= */

    /* ---------- CASE 1: EDIT ELECTION ---------- */
    if (approval.action_type === "EDIT_ELECTION") {
      const {
        title,
        academicYear,
        description,
        positions,
        phases,
        newVoters,
      } = approval.payload

      if (!Array.isArray(phases) || phases.length === 0) {
  console.warn("Skipping phase update: empty payload")
  return
}




      // Update election core
      await supabaseAdmin
        .from("elections")
        .update({
          title,
          academic_year: academicYear,
          description,
        })
        .eq("id", approval.election_id)

      // Replace positions
//       await supabaseAdmin
//         .from("positions")
//         .delete()
//         .eq("election_id", approval.election_id)

//     const { data, error } = await supabaseAdmin
//   .from("positions")
//   .insert(
//     positions.map((p: any) => ({
//       election_id: approval.election_id,
//       name: p.name,
//       allow_multiple: Boolean(p.allow_multiple),
//       max_selections: p.allow_multiple
//         ? p.max_selections ??2
//         : null,
//     }))
//   )
//   .select()

// console.log("INSERT POSITIONS DATA:", data)
// console.log("INSERT POSITIONS ERROR:", error)



      // Replace phases
      await supabaseAdmin
        .from("election_phases")
        .delete()
        .eq("election_id", approval.election_id)

       await supabaseAdmin.from("election_phases").insert(
        phases.map((p: any) => ({
          election_id: approval.election_id,
          phase: p.phase,
          start_date: p.start_date || null,
          end_date: p.end_date || null,
        }))
      )
      

      // Add new voters if provided
      if (Array.isArray(newVoters) && newVoters.length > 0) {
        const voterRows = newVoters.map((email: string) => ({
          election_id: approval.election_id,
          email,
          is_active: true,
        }))

        await supabaseAdmin
          .from("voters")
          .upsert(voterRows, { onConflict: "election_id,email" })
      }

      await supabaseAdmin.from("audit_logs").insert({
        action: "APPROVE_EDIT_ELECTION",
        entity_type: "ELECTION",
        entity_id: approval.election_id.toString(),
        performed_by: user.id,
      })
    }

    /* ---------- CASE 2: CHANGE PHASE ---------- */
    else if (approval.action_type === "CHANGE_PHASE") {
      const { newPhase } = approval.payload

      await supabaseAdmin
        .from("elections")
        .update({ status: newPhase })
        .eq("id", approval.election_id)

      await supabaseAdmin.from("audit_logs").insert({
        action: "APPROVE_CHANGE_PHASE",
        entity_type: "ELECTION",
        entity_id: approval.election_id.toString(),
        performed_by: user.id,
        metadata: { newPhase },
      })
    }




     /* ---------- CASE 3: NOMINATION DECISION ---------- */



     




    else if (approval.action_type === "NOMINATION_DECISION") {
  const { decision } = approval.payload

  // Get nomination info
  const { data: nomination, error: nomErr } = await supabaseAdmin
    .from("nominations")
    .select("id, user_id")
    .eq("id", approval.payload.nomination_id)
    .single()

  if (nomErr) throw nomErr

  // Get nominee info
  const { data: nominee, error: userErr } = await supabaseAdmin
    .from("users")
    .select("email, name")
    .eq("id", nomination.user_id)
    .single()

  if (userErr) throw userErr

  // Update nomination status
  const { data: fire, error: updateErr } = await supabaseAdmin
    .from("nominations")
    .update({
      status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
       workflow_status: decision === "APPROVE" ? "ACTIVE" : "FAILED",
      reviewed_by: user.id,
    })
    .eq("id", approval.payload.nomination_id)

  console.log("NOMINATION UPDATE RESULT:", fire)

  if (updateErr) throw updateErr

  // Send mail to nominee
  await sendMail({
    to: nominee.email,
    subject:
      decision === "APPROVE"
        ? "Your nomination has been approved"
        : "Your nomination has been rejected",
    html: `
      <p>Hello ${nominee.name || "Candidate"},</p>

      ${
        decision === "APPROVE"
          ? `
          <p>Your nomination has been <b>approved</b> by the election committee.</p>
          <p>You are now officially a candidate for the election.</p>
          <p>Best of luck for the upcoming election!</p>
          `
          : `
          <p>Your nomination has been <b>rejected</b> by the election committee.</p>
          <p>You may <b>reapply again</b> with stronger credentials and an improved Statement of Purpose (SOP).</p>
          <p>Please ensure your application clearly highlights your achievements and motivation for the role.</p>
          `
      }
    `,
  })

  // Insert audit log
  const { error: logErr } = await supabaseAdmin.from("audit_logs").insert({
    action: "FINALIZE_NOMINATION",
    entity_type: "NOMINATION",
    entity_id: approval.payload.nomination_id,
    performed_by: user.id,
    metadata: { decision },
  })

  if (logErr) throw logErr
}



//     /* ---------- CASE 4: PUBLISH RESULTS ---------- */
    else if (approval.action_type === "PUBLISH_RESULTS") {
      await supabaseAdmin
    .from("elections")
    .update({
      status: "RESULTS_PUBLISHED",
      results_published: true,
    })
    .eq("id", approval.election_id)

  await supabaseAdmin.from("audit_logs").insert({
    action: "APPROVE_PUBLISH_RESULTS",
    entity_type: "ELECTION",
    entity_id: approval.election_id.toString(),
    performed_by: user.id,
  })
    }

else if (approval.action_type === "INITIATE_PRESIDENT_VOTE") {

  /* 1️⃣ Validate that ties exist */
  const { data: tied } = await supabaseAdmin
  .from("election_results_snapshot")
  .select("position_id")
  .eq("election_id", approval.election_id)
  .eq("is_tie", true)

// console.log("Tied positions found:", tied)

if (!tied || tied.length === 0) {
  return NextResponse.json(
    { error: "No tied positions found" },
    { status: 400 }
  )
}


  /* 2️⃣ Mark election as requiring president vote */
  await supabaseAdmin
    .from("elections")
    .update({ president_vote_required: true })
    .eq("id", approval.election_id)

  /* 3️⃣ Ensure no active token already exists */
  const { data: existingToken } = await supabaseAdmin
    .from("president_vote_tokens")
    .select("id")
    .eq("election_id", approval.election_id)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (existingToken) {
    return NextResponse.json(
      { error: "President vote already initiated" },
      { status: 400 }
    )
  }

  /* 4️⃣ Fetch president */
  const { data: president } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("role", "PRESIDENT")
    .single()

  if (!president) {
    return NextResponse.json(
      { error: "President not configured" },
      { status: 500 }
    )
  }

  /* 5️⃣ Generate single token */
  const token = crypto.randomUUID()

  await supabaseAdmin.from("president_vote_tokens").insert({
    election_id: approval.election_id,
    token,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
  })

  /* 6️⃣ Send ONE email */
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/president/vote?token=${token}`

  await sendMail({
    to: president.email,
    subject: "President tie-breaker vote required",
    html: `
      <p>One or more positions are tied in the election.</p>
      <p>Please resolve all ties using the link below:</p>
      <a href="${link}">${link}</a>
    `,
  })

  /* 7️⃣ Audit log */
  await supabaseAdmin.from("audit_logs").insert({
    action: "INITIATE_PRESIDENT_VOTE_APPROVED",
    entity_type: "ELECTION",
    entity_id: approval.election_id.toString(),
    performed_by: user.id,
  })
}



    /* ---------- UNSUPPORTED ---------- */
    else {
      return NextResponse.json(
        { error: "Unsupported approval type" },
        { status: 400 }
      )
    }

    /* =========================
       5. FINALIZE APPROVAL
       ========================= */
    await supabaseAdmin
      .from("approval_requests")
      .update({
        status: "APPROVED",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", approval.id)

      /* =========================
   NOTIFY ADMIN (EMAIL)
   ========================= */
const { data: admin, error: adminError } = await supabaseAdmin
  .from("users")
  .select("email, name")
  .eq("id", approval.requested_by)
  .single()

if (adminError || !admin) {
  console.error("Admin not found for approval notification")
} else {
  await sendMail({
    to: admin.email,
    subject: "Approval Request Approved",
    html: `
      <p>Hello ${admin.name || "Admin"},</p>

      <p>Your approval request has been <strong>APPROVED</strong> by the observer.</p>

      <p><strong>Action:</strong> ${approval.action_type}</p>
      <p><strong>Election ID:</strong> ${approval.election_id}</p>

      <p>The requested action has been successfully executed.</p>

      <p>— IIT BBS Elections System</p>
    `,
  })
}



    return NextResponse.json({ status: "APPROVED" })
  } catch (err) {
    console.error("OBSERVER APPROVAL ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
