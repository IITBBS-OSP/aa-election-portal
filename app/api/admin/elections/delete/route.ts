import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function DELETE(
  req: Request
) {
  try {
    const electionId = await req.json().then(data => data.electionId)
    
    if (!electionId) {
      return NextResponse.json(
        { error: "electionId is required" },
        { status: 400 }
      )
    }

    /* =========================
       1. AUTH & ROLE CHECK
       ========================= */
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    /* =========================
       2. CHECK ELECTION EXISTS
       ========================= */
    const { data: election } = await supabaseAdmin
      .from("elections")
      .select("id")
      .eq("id", electionId)
      .single()

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      )
    }

    /* =========================
       3. DELETE RELATED DATA
       ========================= */

    await supabaseAdmin
      .from("positions")
      .delete()
      .eq("election_id", electionId)

    await supabaseAdmin
      .from("election_phases")
      .delete()
      .eq("election_id", electionId)

      await supabaseAdmin
  .from("approval_requests")
  .delete()
  .eq("election_id", electionId)

    await supabaseAdmin
      .from("voters")
      .delete()
      .eq("election_id", electionId)

    await supabaseAdmin
      .from("voter_upload_batches")
      .delete()
      .eq("election_id", electionId)

    /* =========================
       4. DELETE ELECTION
       ========================= */
    const { error: deleteError } =
      await supabaseAdmin
        .from("elections")
        .delete()
        .eq("id", electionId)

    if (deleteError) {
      throw deleteError
    }

    /* =========================
       5. AUDIT LOG
       ========================= */
    await supabaseAdmin.from("audit_logs").insert({
      action: "DELETE_ELECTION",
      entity_type: "ELECTION",
      entity_id: electionId,
      performed_by: user.id,
      metadata: {},
    })

    /* =========================
       6. RESPONSE
       ========================= */
    return NextResponse.json(
      { message: "Election deleted successfully" },
      { status: 200 }
    )
  } catch (err) {
    console.error("DELETE ELECTION ERROR:", err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}