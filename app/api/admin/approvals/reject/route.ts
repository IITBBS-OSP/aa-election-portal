// // app/api/admin/approvals/reject/route.ts
// import { NextResponse } from "next/server"
// import { getSupabaseServerClient } from "@/lib/supabaseServer"
// import { supabaseAdmin } from "@/lib/supabaseAdmin"
// import { sendMail } from "@/lib/mailer"

// export async function POST(req: Request) {
//   try {
//     /* =========================
//        1. AUTH & ROLE CHECK
//        ========================= */
//     const supabase = await getSupabaseServerClient()

//     const {
//       data: { user },
//     } = await supabase.auth.getUser()

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { data: profile } = await supabase
//       .from("users")
//       .select("role")
//       .eq("id", user.id)
//       .single()

//     if (!profile || profile.role !== "OBSERVER") {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
//     }

//     /* =========================
//        2. READ REQUEST BODY
//        ========================= */
//     const body = await req.json()
//     const { approvalRequestId, rejectionReason } = body

//     console.log("Reject Approval Request ID:", approvalRequestId)

//     if (!approvalRequestId) {
//       return NextResponse.json(
//         { error: "approvalRequestId is required" },
//         { status: 400 }
//       )
//     }

//     if (!rejectionReason) {
//       return NextResponse.json(
//         { error: "rejectionReason is required" },
//         { status: 400 }
//       )
//     }

//     /* =========================
//        3. FETCH APPROVAL REQUEST
//        ========================= */
//     const { data: approval, error } = await supabaseAdmin
//       .from("approval_requests")
//       .select("*")
//       .eq("id", approvalRequestId)
//       .eq("status", "PENDING")
//       .single()

//     if (error || !approval) {
//       return NextResponse.json(
//         { error: "Approval request not found or already processed" },
//         { status: 404 }
//       )
//     }

//     /* =========================
//        4. HANDLE REJECTION TYPES
//        ========================= */

//     /* ---------- CASE 1: EDIT ELECTION ---------- */
//     if (approval.action_type === "EDIT_ELECTION") {

//       await supabaseAdmin.from("audit_logs").insert({
//         action: "REJECT_EDIT_ELECTION",
//         entity_type: "ELECTION",
//         entity_id: approval.election_id.toString(),
//         performed_by: user.id,
//       })

//     }

//     /* ---------- CASE 2: CHANGE PHASE ---------- */
//     else if (approval.action_type === "CHANGE_PHASE") {

//       await supabaseAdmin.from("audit_logs").insert({
//         action: "REJECT_CHANGE_PHASE",
//         entity_type: "ELECTION",
//         entity_id: approval.election_id.toString(),
//         performed_by: user.id,
//       })

//     }

//     /* ---------- CASE 3: NOMINATION DECISION ---------- */
//     else if (approval.action_type === "NOMINATION_DECISION") {

//       await supabaseAdmin.from("audit_logs").insert({
//         action: "REJECT_NOMINATION_DECISION",
//         entity_type: "NOMINATION",
//         entity_id: approval.payload.nomination_id,
//         performed_by: user.id,
//       })

//     }

//     /* ---------- CASE 4: PUBLISH RESULTS ---------- */
//     else if (approval.action_type === "PUBLISH_RESULTS") {

//       await supabaseAdmin.from("audit_logs").insert({
//         action: "REJECT_PUBLISH_RESULTS",
//         entity_type: "ELECTION",
//         entity_id: approval.election_id.toString(),
//         performed_by: user.id,
//       })

//     }

//     /* ---------- CASE 5: INITIATE PRESIDENT VOTE ---------- */
//     else if (approval.action_type === "INITIATE_PRESIDENT_VOTE") {

//       await supabaseAdmin.from("audit_logs").insert({
//         action: "REJECT_INITIATE_PRESIDENT_VOTE",
//         entity_type: "ELECTION",
//         entity_id: approval.election_id.toString(),
//         performed_by: user.id,
//       })

//     }

//     /* ---------- UNSUPPORTED ---------- */
//     else {
//       return NextResponse.json(
//         { error: "Unsupported approval type" },
//         { status: 400 }
//       )
//     }

//     /* =========================
//        5. FINALIZE REJECTION
//        ========================= */
//     await supabaseAdmin
//       .from("approval_requests")
//       .update({
//         status: "REJECTED",
//         reviewed_by: user.id,
//         reviewed_at: new Date().toISOString(),
//       })
//       .eq("id", approval.id)

//     /* =========================
//        NOTIFY ADMIN (EMAIL)
//        ========================= */
//     const { data: admin, error: adminError } = await supabaseAdmin
//       .from("users")
//       .select("email, name")
//       .eq("id", approval.requested_by)
//       .single()

//     if (adminError || !admin) {
//       console.error("Admin not found for rejection notification")
//     } else {
//       await sendMail({
//         to: admin.email,
//         subject: "Approval Request Rejected",
//         html: `
//         <p>Hello ${admin.name || "Admin"},</p>

//         <p>Your approval request has been <strong>REJECTED</strong> by the observer.</p>

//         <p><strong>Action:</strong> ${approval.action_type}</p>
//         <p><strong>Election ID:</strong> ${approval.election_id}</p>

//         <p><strong>Reason for rejection:</strong></p>
//         <p>${rejectionReason}</p>

//         <p>Please update the request and submit again.</p>

//         <p>— IIT BBS Elections System</p>
//         `,
//       })
//     }

//     return NextResponse.json({ status: "REJECTED" })

//   } catch (err) {
//     console.error("OBSERVER REJECT ERROR:", err)
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }







// app/api/admin/approvals/reject/route.ts
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

    console.log("Reject Approval Request ID:", approvalRequestId)

    if (!approvalRequestId) {
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
       4. HANDLE REJECTION TYPES
       ========================= */

    /* ---------- CASE 1: EDIT ELECTION ---------- */
    if (approval.action_type === "EDIT_ELECTION") {
      await supabaseAdmin.from("audit_logs").insert({
        action: "REJECT_EDIT_ELECTION",
        entity_type: "ELECTION",
        entity_id: approval.election_id.toString(),
        performed_by: user.id,
      })
    }

    /* ---------- CASE 2: CHANGE PHASE ---------- */
    else if (approval.action_type === "CHANGE_PHASE") {
      await supabaseAdmin.from("audit_logs").insert({
        action: "REJECT_CHANGE_PHASE",
        entity_type: "ELECTION",
        entity_id: approval.election_id.toString(),
        performed_by: user.id,
      })
    }

    /* ---------- CASE 3: NOMINATION DECISION ---------- */
    else if (approval.action_type === "NOMINATION_DECISION") {
      const nominationId = approval.payload?.nomination_id

//       if (!nominationId) {
//   return NextResponse.json(
//     { error: "Nomination ID missing in payload" },
//     { status: 400 }
//   )
// }

  /* ---------- AUDIT LOG ---------- */
  await supabaseAdmin.from("audit_logs").insert({
    action: "REJECT_NOMINATION_DECISION",
    entity_type: "NOMINATION",
    entity_id: nominationId,
    performed_by: user.id,
  })

  /* ---------- DELETE NOMINATION ---------- */
  // if (nominationId) {
  //   const { error: deleteError } = await supabaseAdmin
  //     .from("nominations")
  //     .delete()
  //     .eq("id", nominationId)

  //   if (deleteError) {
  //     console.error("Failed to delete nomination:", deleteError)
  //     throw deleteError
  //   }
  }
    /* ---------- CASE 4: PUBLISH RESULTS ---------- */
    else if (approval.action_type === "PUBLISH_RESULTS") {
      await supabaseAdmin.from("audit_logs").insert({
        action: "REJECT_PUBLISH_RESULTS",
        entity_type: "ELECTION",
        entity_id: approval.election_id.toString(),
        performed_by: user.id,
      })
    }

    /* ---------- CASE 5: INITIATE PRESIDENT VOTE ---------- */
    else if (approval.action_type === "INITIATE_PRESIDENT_VOTE") {
      await supabaseAdmin.from("audit_logs").insert({
        action: "REJECT_INITIATE_PRESIDENT_VOTE",
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
       5. FINALIZE REJECTION
       ========================= */
    await supabaseAdmin
      .from("approval_requests")
      .update({
        status: "REJECTED",
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
      console.error("Admin not found for rejection notification")
    } else {
      await sendMail({
        to: admin.email,
        subject: "Approval Request Rejected",
        html: `
        <p>Hello ${admin.name || "Admin"},</p>

        <p>Your approval request has been <strong>REJECTED</strong> by the observer.</p>

        <p><strong>Action:</strong> ${approval.action_type}</p>
        <p><strong>Election ID:</strong> ${approval.election_id}</p>

        <p>— IIT BBS Elections System</p>
        `,
      })
    }

    return NextResponse.json({ status: "REJECTED" })

  } catch (err) {
    console.error("OBSERVER REJECT ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}