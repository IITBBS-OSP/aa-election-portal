// app/api/user/nominations/create/route.ts
import crypto from "crypto"
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { sendMail } from "@/lib/mailer"

export async function POST(req: Request) {
  let nominationId: string | null = null
  const IS_DEV = process.env.NODE_ENV !== "production"


  try {
    /* =========================
       AUTH
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* =========================
       PARSE FORM DATA
       ========================= */
    const formData = await req.formData()

    const electionId = Number(formData.get("electionId"))
    const positionId = Number(formData.get("positionId"))
    const graduationYear = Number(formData.get("graduationYear"))
    const department = String(formData.get("department") || "")
    const proposerEmail = String(formData.get("proposerEmail") || "").toLowerCase()
    const seconderEmail = String(formData.get("seconderEmail") || "").toLowerCase()

    const candidateImage = formData.get("candidateImage") as File | null
    const sopFile = formData.get("sopFile") as File | null

    if (
      !electionId ||
      !positionId ||
      !proposerEmail ||
      !seconderEmail ||
      !candidateImage ||
      !sopFile
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    /* =========================
       EMAIL LOGIC VALIDATION
       ========================= */
    if (
      proposerEmail === seconderEmail ||
      proposerEmail === user.email ||
      seconderEmail === user.email
    ) {
      return NextResponse.json(
        { error: "Invalid proposer/seconder email combination" },
        { status: 400 }
      )
    }

    /* =========================
       FILE VALIDATION
       ========================= */
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024
    const MAX_PDF_SIZE = 5 * 1024 * 1024

    if (!["image/jpeg", "image/png"].includes(candidateImage.type)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 }
      )
    }

    if (candidateImage.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image exceeds 2MB limit" },
        { status: 400 }
      )
    }

    if (sopFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid SOP file type" },
        { status: 400 }
      )
    }

    if (sopFile.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "SOP exceeds 5MB limit" },
        { status: 400 }
      )
    }

    /* =========================
       VALIDATE SUPPORTERS
       ========================= */
    for (const email of [proposerEmail, seconderEmail]) {
      const { data: voter } = await supabaseAdmin
        .from("voters")
        .select("id")
        .eq("election_id", electionId)
        .eq("email", email)
        .eq("is_active", true)
        .maybeSingle()

      if (!voter) {
        return NextResponse.json(
          { error: `Invalid supporter: ${email}` },
          { status: 400 }
        )
      }
    }

    /* =========================
       FETCH VERIFIED NAME
       ========================= */
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single()

      /* =========================
   CHECK EXISTING NOMINATION
   ========================= */
// const { data: existingNomination } = await supabaseAdmin
//   .from("nominations")
//   .select("id")
//   .eq("election_id", electionId)
//   .eq("user_id", user.id)
//   .in("workflow_status", ["IN_PROGRESS", "ACTIVE"])
//   .maybeSingle()



const { data: existingNomination, error: existingError } = await supabaseAdmin
  .from("nominations")
  .select("id")
  .eq("election_id", electionId)
  .eq("user_id", user.id)
  .neq("status", "REJECTED")
  .in("workflow_status", ["IN_PROGRESS", "ACTIVE"])
  .limit(1)

  // console.log("Existing nomination check:", { existingNomination, existingError })

if (existingError) throw existingError
if (existingNomination && existingNomination.length > 0) {
  return NextResponse.json(
    {
      error:
        "You have already submitted a nomination for this election. Only one nomination per election is allowed.",
    },
    { status: 400 }
  )
}


    /* =========================
       UPLOAD FILES
       ========================= */
    const imagePath = `election_${electionId}/${user.id}_${crypto.randomUUID()}.jpg`
    const sopPath = `election_${electionId}/${user.id}_${crypto.randomUUID()}.pdf`

    await supabaseAdmin.storage
      .from("candidate-images")
      .upload(imagePath, candidateImage)

    await supabaseAdmin.storage
      .from("sop-files")
      .upload(sopPath, sopFile)

    const imageUrl = supabaseAdmin.storage
      .from("candidate-images")
      .getPublicUrl(imagePath).data.publicUrl

    const sopUrl = supabaseAdmin.storage
      .from("sop-files")
      .getPublicUrl(sopPath).data.publicUrl

    /* =========================
       CREATE NOMINATION (SAFE)
       ========================= */
    const { data: nomination, error: nominationError } =
      await supabaseAdmin
        .from("nominations")
        .insert({
          election_id: electionId,
          position_id: positionId,
          user_id: user.id,
          name: profile?.name,
          graduation_year: graduationYear,
          department,
          candidate_image_url: imageUrl,
          sop_file_url: sopUrl,
          status: "PENDING_SUPPORTER_APPROVAL",
          workflow_status: "IN_PROGRESS",
        })
        .select()
        .single()

    if (nominationError || !nomination) {
      throw nominationError ?? new Error("Failed to create nomination")
    }

    nominationId = nomination.id

    /* =========================
       SUPPORTERS + EMAIL
       ========================= */
    for (const role of ["PROPOSER", "SECONDER"] as const) {
      const email = role === "PROPOSER" ? proposerEmail : seconderEmail
      const token = crypto.randomUUID()

      await supabaseAdmin.from("nomination_supporter_tokens").insert({
        nomination_id: nomination.id,
        role,
        email,
        token,
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
      })

      await sendMail({
        to: email,
        subject: `Nomination ${role.toLowerCase()} approval`,
        html: `
          <p>You have been listed as ${role.toLowerCase()} for ${nomination.name}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/nomination/approve?token=${token}">
            Approve nomination
          </a>
        `,
      })
    }

    /* =========================
       FINALIZE WORKFLOW
       ========================= */
    await supabaseAdmin
      .from("nominations")
      .update({ workflow_status: "ACTIVE" })
      .eq("id", nomination.id)

    return NextResponse.json({ status: "NOMINATION_SUBMITTED" })
  } catch (err) {
    console.error("CREATE NOMINATION ERROR:", err)

    if (nominationId) {
      await supabaseAdmin
        .from("nominations")
        .update({ workflow_status: "FAILED" })
        .eq("id", nominationId)
    }

    return NextResponse.json(
      { error: "Nomination submission failed" },
      { status: 500 }
    )
  }
}
