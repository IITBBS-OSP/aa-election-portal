import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =========================
       2. PARSE FORM DATA
       ========================= */
    const formData = await req.formData()

    const title = formData.get("title") as string
    const academicYear = formData.get("academicYear") as string
    const description = formData.get("description") as string

    const positions = JSON.parse(formData.get("positions") as string)
    const phases = JSON.parse(formData.get("phases") as string)

    const voterFile = formData.get("voterFile") as File | null

    if (
      !title ||
      !academicYear ||
      !positions?.length ||
      !phases?.length ||
      !voterFile
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    

    /* =========================
       3. CREATE ELECTION
       ========================= */
    const { data: election, error: electionError } =
      await supabaseAdmin
        .from("elections")
        .insert({
          title,
          academic_year: academicYear,
          description,
          created_by: user.id,
        })
        .select()
        .single()

    if (electionError || !election) {
      throw electionError
    }

    /* =========================
       4. INSERT POSITIONS
       (WITH MAX SELECTIONS)
       ========================= */
    const positionRows = positions.map((p: any) => {
      if (p.allowMultiple && (!p.maxSelections || p.maxSelections < 2)) {
        throw new Error(
          `Invalid maxSelections for position: ${p.name}`
        )
      }

      return {
        election_id: election.id,
        name: p.name,
        allow_multiple: p.allowMultiple,
        max_selections: p.allowMultiple ? p.maxSelections : null,
      }
    })

    await supabaseAdmin.from("positions").insert(positionRows)

    /* =========================
       5. INSERT PHASES
       ========================= */
    const phaseRows = phases.map((p: any) => ({
      election_id: election.id,
      phase: p.phase,
      start_date: p.start,
      end_date: p.end,
    }))

    await supabaseAdmin.from("election_phases").insert(phaseRows)

    /* =========================
       6. HANDLE VOTER FILE (REQUIRED)
       ========================= */
    const text = await voterFile.text()

    const emails = text
      .split(/\r?\n/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"))

    const uniqueEmails = Array.from(new Set(emails))

    const { data: batch, error: batchError } =
      await supabaseAdmin
        .from("voter_upload_batches")
        .insert({
          election_id: election.id,
          uploaded_by: user.id,
          filename: voterFile.name,
          total_records: uniqueEmails.length,
        })
        .select()
        .single()

    if (batchError || !batch) {
      throw batchError
    }

    const voterRows = uniqueEmails.map((email) => ({
      election_id: election.id,
      email,
      batch_id: batch.id,
    }))

    await supabaseAdmin.from("voters").insert(voterRows)

    /* =========================
       7. AUDIT LOG
       ========================= */
    await supabaseAdmin.from("audit_logs").insert({
      action: "CREATE_ELECTION",
      entity_type: "ELECTION",
      entity_id: election.id.toString(),
      performed_by: user.id,
      metadata: {
        positions_count: positions.length,
        phases_count: phases.length,
        voters_uploaded: uniqueEmails.length,
      },
    })

    /* =========================
       8. RESPONSE
       ========================= */
    return NextResponse.json(
      { electionId: election.id },
      { status: 201 }
    )
  } catch (err) {
    console.error("CREATE ELECTION ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
