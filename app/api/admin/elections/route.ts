// app/api/admin/elections/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
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

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "OBSERVER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: elections, error } = await supabaseAdmin
      .from("elections")
      .select(`
        id,
        title,
        academic_year,
        status,
        created_at,
        positions:positions(count),
        candidates:nominations(count)
      `)
      .eq("candidates.status", "APPROVED")
      .order("created_at", { ascending: false })

    if (error) throw error

    const created: any[] = []
    const ongoing: any[] = []
    const past: any[] = []

    for (const election of elections ?? []) {
      const enrichedElection = {
        id: election.id,
        title: election.title,
        academic_year: election.academic_year,
        status: election.status,
        created_at: election.created_at,
        positionCount: election.positions?.[0]?.count ?? 0,
        candidateCount: election.candidates?.[0]?.count ?? 0,
      }

      if (["CREATED", "DRAFT"].includes(election.status)) {
        created.push(enrichedElection)
      } else if (["NOMINATION", "VOTING", "CAMPAIGN"].includes(election.status)) {
        ongoing.push(enrichedElection)
      } else if (["CLOSED", "RESULTS_PUBLISHED"].includes(election.status)) {
        past.push(enrichedElection)
      }
    }

    return NextResponse.json({
      created,
      ongoing,
      past,
    })
  } catch (err) {
    console.error("FETCH ELECTIONS ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
