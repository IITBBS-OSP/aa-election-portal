// app/api/user/elections/[id]/voting/route.ts
import { NextResponse,NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(
 req: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
     const url = new URL(req.url)
    const parts = url.pathname.split("/")
    const electionId = Number(parts[parts.length - 2])

    if (Number.isNaN(electionId)) {
      return NextResponse.json({ error: "Invalid election id" }, { status: 400 })
    }

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
       FETCH POSITIONS
       ========================= */
    const { data: positions, error: posError } = await supabaseAdmin
      .from("positions")
      .select(`
        id,
        name,
        allow_multiple,
        max_selections
      `)
      .eq("election_id", electionId)
      .order("id")

    if (posError) throw posError

    /* =========================
       FETCH APPROVED NOMINATIONS
       ========================= */
    const { data: nominations, error: nomError } = await supabaseAdmin
      .from("nominations")
      .select(`
        id,
        position_id,
        name,
        user_id,
        graduation_year,
        department
      `)
      .eq("election_id", electionId)
      .eq("status", "APPROVED")
      .eq("workflow_status", "ACTIVE")

    if (nomError) throw nomError

    /* =========================
       GROUP BY POSITION
       ========================= */
    const positionMap = positions.map((pos) => ({
      positionId: pos.id,
      positionName: pos.name,
      allowMultiple: pos.allow_multiple,
      maxSelections: pos.max_selections,
      candidates: nominations
        .filter((n) => n.position_id === pos.id)
        .map((n) => ({
          nominationId: n.id,
          candidateName: n.name,
          userId: n.user_id,
          year: n.graduation_year,
          department: n.department,
        })),
    }))

    return NextResponse.json({
      electionId,
      positions: positionMap,
    })
  } catch (err) {
    console.error("FETCH VOTING DATA ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
