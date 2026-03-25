// app/api/user/nominations/status/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    /* =========================
       AUTH
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* =========================
       FETCH NOMINATIONS
       ========================= */
    const { data: nominations, error } = await supabaseAdmin
      .from("nominations")
      .select("id, election_id, position_id, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    if (!nominations || nominations.length === 0) {
      return NextResponse.json([])
    }

    const nominationIds = nominations.map(n => n.id)
    const electionIds = [...new Set(nominations.map(n => n.election_id))]
    const positionIds = [...new Set(nominations.map(n => n.position_id))]

    /* =========================
       FETCH ELECTIONS & POSITIONS
       ========================= */
    const { data: elections } = await supabaseAdmin
      .from("elections")
      .select("id, title")
      .in("id", electionIds)

    const { data: positions } = await supabaseAdmin
      .from("positions")
      .select("id, name")
      .in("id", positionIds)

    const electionMap = new Map(elections?.map(e => [e.id, e.title]))
    const positionMap = new Map(positions?.map(p => [p.id, p.name]))

    /* =========================
       FETCH SUPPORTER APPROVALS
       (DO NOT TOUCH – WORKING)
       ========================= */
    const { data: supporters, error: supportersError } = await supabaseAdmin
      .from("nomination_supporter_tokens")
      .select("nomination_id, role, approved")
      .in("nomination_id", nominationIds)

    if (supportersError) throw supportersError

    const supporterStatus = (
      nominationId: string,
      role: "PROPOSER" | "SECONDER"
    ): "completed" | "pending" => {
      const row = supporters?.find(
        s => s.nomination_id === nominationId && s.role === role
      )
      return row?.approved ? "completed" : "pending"
    }

    /* =========================
       FETCH APPROVAL REQUESTS
       ========================= */
    const { data: approvals } = await supabaseAdmin
      .from("approval_requests")
      .select("payload, status")
      .eq("election_id", electionIds[0])

    /* =========================
       BUILD RESPONSE
       ========================= */
    const response = nominations.map(n => {
      const proposer = supporterStatus(n.id, "PROPOSER")
      const seconder = supporterStatus(n.id, "SECONDER")

      // 🔥 BULLETPROOF PAYLOAD MATCH (THIS IS THE FIX)
      const approval = approvals?.find(a => {
        const pid =
          a.payload?.nominationId ??
          a.payload?.nomination_id ??
          a.payload?.id

        return pid?.toString() === n.id.toString()
      })

      let adminStatus: "completed" | "pending" | "rejected" = "pending"
      let observerStatus: "completed" | "pending" | "rejected" = "pending"

      if (approval) {
        if (approval.status === "APPROVED") {
          adminStatus = "completed"
          observerStatus = "completed"
        } else if (approval.status === "REJECTED") {
          adminStatus = "rejected"
          observerStatus = "rejected"
        }
      }

      const overallStatus =
        approval?.status === "REJECTED"
          ? "rejected"
          : approval?.status === "APPROVED"
          ? "approved"
          : "pending"

      return {
        id: n.id,
        electionName: electionMap.get(n.election_id) || "Election",
        position: positionMap.get(n.position_id) || "Position",
        overallStatus,
        approvalSteps: [
          { step: 1, label: "Proposer Approval", status: proposer },
          { step: 2, label: "Seconder Approval", status: seconder },
          { step: 3, label: "Election Officer Approval", status: adminStatus },
          { step: 4, label: "Observer Approval", status: observerStatus },
        ],
      }
    })

    return NextResponse.json(response)
  } catch (err) {
    console.error("NOMINATION STATUS ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
