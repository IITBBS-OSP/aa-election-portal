// app/api/nomination/supporter/approve/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 })
    }

    /* =========================
       FETCH TOKEN
       ========================= */
    const { data: supporter, error: fetchError } = await supabaseAdmin
      .from("nomination_supporter_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle()

    if (fetchError || !supporter) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    }

    if (supporter.used) {
      return NextResponse.json(
        { error: "Token already used" },
        { status: 409 }
      )
    }

    if (new Date(supporter.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 410 }
      )
    }

    /* =========================
       APPROVE SUPPORTER
       ========================= */
    const { error: updateError } = await supabaseAdmin
      .from("nomination_supporter_tokens")
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        used: true,
      })
      .eq("id", supporter.id)

    if (updateError) {
      console.error("SUPPORTER UPDATE ERROR:", updateError)
      return NextResponse.json(
        { error: "Failed to approve supporter" },
        { status: 500 }
      )
    }

    /* =========================
       CHECK BOTH ROLES APPROVED
       ========================= */
    const { data: approvals, error: approvalsError } =
      await supabaseAdmin
        .from("nomination_supporter_tokens")
        .select("approved")
        .eq("nomination_id", supporter.nomination_id)

    if (approvalsError) {
      console.error("APPROVAL FETCH ERROR:", approvalsError)
      return NextResponse.json(
        { error: "Failed to verify approvals" },
        { status: 500 }
      )
    }

    const allApproved =
      approvals?.length === 2 &&
      approvals.every(a => a.approved === true)

    if (allApproved) {
      const { error: nominationError } = await supabaseAdmin
        .from("nominations")
        .update({ status: "PENDING_ADMIN_REVIEW" })
        .eq("id", supporter.nomination_id)

      if (nominationError) {
        console.error("NOMINATION UPDATE ERROR:", nominationError)
        return NextResponse.json(
          { error: "Failed to update nomination status" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ status: "APPROVED" })
  } catch (err) {
    console.error("SUPPORTER APPROVAL ERROR:", err)
    return NextResponse.json(
      { error: "Approval failed" },
      { status: 500 }
    )
  }
}
