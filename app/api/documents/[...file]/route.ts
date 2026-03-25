import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(
  _req: Request,
  context: { params: Promise<{ file: string[] }> }
) {
  try {
    /* =========================
       1. AUTHENTICATE USER
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* =========================
       2. UNWRAP PARAMS
       ========================= */
    const { file } = await context.params

    if (!file || file.length === 0) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      )
    }

    const rawPath = file.join("/")

    /* =========================
       3. DETECT BUCKET + OBJECT PATH
       ========================= */
    let objectPath = rawPath
    let bucketName = "sop-files" // default

    if (rawPath.startsWith("http")) {
      const match = rawPath.match(
        /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
      )

      if (!match) {
        return NextResponse.json(
          { error: "Invalid file URL" },
          { status: 400 }
        )
      }

      bucketName = match[1]        // e.g. sop-files | candidate-images
      objectPath = match[2]        // e.g. election_2/xyz.png
    }

    /* =========================
       4. EXTRACT ELECTION ID
       ========================= */
    const electionMatch = objectPath.match(/^election_(\d+)\//)
    if (!electionMatch) {
      return NextResponse.json(
        { error: "Invalid document path" },
        { status: 400 }
      )
    }

    const electionId = Number(electionMatch[1])
    const userEmail = user.email.toLowerCase()

    /* =========================
       5. AUTHORIZE USER
       (ADMIN / OBSERVER / VOTER)
       ========================= */
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const isPrivileged =
      profile?.role === "ADMIN" || profile?.role === "OBSERVER"

    let isVoter = false

    if (!isPrivileged) {
      const { data: voter } = await supabase
        .from("voters")
        .select("id")
        .eq("election_id", electionId)
        .eq("email", userEmail)
        .eq("is_active", true)
        .maybeSingle()

      isVoter = Boolean(voter)
    }

    // ✅ voters ARE allowed
    if (!isPrivileged && !isVoter) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    /* =========================
       6. CREATE SIGNED URL
       ========================= */
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(objectPath, 60 * 10) // 10 minutes

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    /* =========================
       7. REDIRECT
       ========================= */
    return NextResponse.redirect(data.signedUrl)
  } catch (err) {
    console.error("SECURE DOCUMENT ACCESS ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
