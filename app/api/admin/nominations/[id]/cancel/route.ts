import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { sendMail } from "@/lib/mailer"
import { getSupabaseServerClient } from "@/lib/supabaseServer"


export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    /* =========================
       AUTHORIZATION CHECK
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
   
       if (!profile || profile.role !== "OBSERVER" && profile.role !== "ADMIN") {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 })
       }
   
    /* =========================
       GET NOMINATION ID
    ========================= */

    const { id: nominationId } = await context.params

    if (!nominationId) {
      return NextResponse.json(
        { error: "Nomination ID required" },
        { status: 400 }
      )
    }

    /* =========================
       GET NOMINATION
    ========================= */

    const { data: nomination, error: nomErr } = await supabaseAdmin
      .from("nominations")
      .select("id, user_id, position_id")
      .eq("id", nominationId)
      .single()

    if (nomErr) throw nomErr

    /* =========================
       GET NOMINEE INFO
    ========================= */

    const { data: nominee, error: userErr } = await supabaseAdmin
      .from("users")
      .select("email, name")
      .eq("id", nomination.user_id)
      .single()

    if (userErr) throw userErr

    /* =========================
       GET ELECTION STATUS
    ========================= */

    const { data: position, error: posErr } = await supabaseAdmin
      .from("positions")
      .select("election_id")
      .eq("id", nomination.position_id)
      .single()

    if (posErr) throw posErr

    const { data: election, error: electionErr } = await supabaseAdmin
      .from("elections")
      .select("status")
      .eq("id", position.election_id)
      .single()

    if (electionErr) throw electionErr

    if (election.status !== "CAMPAIGN") {
      return NextResponse.json(
        {
          error:
            "Nomination cancellation is only allowed during the campaign phase",
        },
        { status: 403 }
      )
    }

    /* =========================
       UPDATE NOMINATION
    ========================= */

    const { error: updateErr } = await supabaseAdmin
      .from("nominations")
      .update({
        status: "REJECTED",
        workflow_status: "FAILED",
        reviewed_by: user.id
      })
      .eq("id", nominationId)

    if (updateErr) throw updateErr

    /* =========================
       SEND EMAIL
    ========================= */

    await sendMail({
      to: nominee.email,
      subject: "Your nomination has been cancelled",
      html: `
        <p>Hello ${nominee.name || "Candidate"},</p>

        <p>Your nomination has been <b>cancelled</b> by the election committee.</p>

        <p>This action was taken after reviewing reports raised during the campaign phase.</p>

        <p>You will no longer appear as a candidate in the election.</p>

        <br/>

        <p>Regards,<br/>
        Election Committee</p>
      `,
    })

    return NextResponse.json({
      message: "Nomination cancelled successfully",
    })
  } catch (err) {
    console.error("Cancel nomination error:", err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}