// app/api/user/elections/[electionId]/candidates/route.ts
import { NextResponse, NextRequest } from "next/server"

import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    /* =========================
       1. AUTH CHECK
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

    const url = new URL(req.url)
    const id = url.pathname.split("/").slice(-2)[0]
    const electionId = Number(id)

    if (Number.isNaN(electionId)) {
      return NextResponse.json(
        { error: "Invalid electionId" },
        { status: 400 }
      )
    }

    const userEmail = user.email.toLowerCase()

    /* =========================
       2. ROLE CHECK (ADMIN / OBSERVER BYPASS)
       ========================= */
    const { data: userProfile, error: roleError } =
      await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (roleError) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isPrivileged =
      userProfile.role === "ADMIN" ||
      userProfile.role === "OBSERVER"

    /* =========================
       3. VOTER CHECK (ONLY FOR NON-PRIVILEGED USERS)
       ========================= */
    if (!isPrivileged) {
      const { data: voter } = await supabaseAdmin
        .from("voters")
        .select("id")
        .eq("election_id", electionId)
        .eq("email", userEmail)
        .eq("is_active", true)
        .maybeSingle()

      if (!voter) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    }

    /* =========================
       4. FETCH APPROVED CANDIDATES
       ========================= */
    const { data: nominations, error } = await supabaseAdmin
      .from("nominations")
      .select(`
        id,
        name,
        graduation_year,
        department,
        candidate_image_url,
        sop_file_url,
        position_id,
        positions (
          id,
          name
        )
      `)
      .eq("election_id", electionId)
      .eq("status", "APPROVED")
      .order("position_id", { ascending: true })

    if (error) {
      throw error
    }

    /* =========================
       5. GROUP BY POSITION
       ========================= */
    const grouped: Record<number, any> = {}

    nominations.forEach((n: any) => {
      const positionId = n.position_id

      if (!grouped[positionId]) {
        grouped[positionId] = {
          positionId,
          positionName: n.positions.name,
          candidates: [],
        }
      }

      grouped[positionId].candidates.push({
        nominationId: n.id,
        name: n.name,
        graduationYear: n.graduation_year,
        department: n.department,
        imageUrl: n.candidate_image_url,
        sopUrl: n.sop_file_url,
      })
    })

    /* =========================
       6. RESPONSE
       ========================= */
    return NextResponse.json(
      Object.values(grouped)
    )
  } catch (err) {
    console.error("FETCH APPROVED CANDIDATES ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
