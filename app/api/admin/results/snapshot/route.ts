// // app/api/admin/results/snapshot/route.ts
// import { NextResponse } from "next/server"
// import { getSupabaseServerClient } from "@/lib/supabaseServer"
// import { supabaseAdmin } from "@/lib/supabaseAdmin"

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url)
//     const electionId = Number(url.searchParams.get("electionId"))

//     if (Number.isNaN(electionId)) {
//       return NextResponse.json(
//         { error: "Invalid electionId" },
//         { status: 400 }
//       )
//     }

//     /* ================= AUTH ================= */
//     const supabase = await getSupabaseServerClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       )
//     }

//     /* ================= COMPUTE SNAPSHOT ================= */
//     const { error: computeError } = await supabaseAdmin.rpc(
//       "compute_and_snapshot_results",
//       { p_election_id: electionId }
//     )

//     if (computeError) throw computeError

//     /* ================= FETCH SNAPSHOT WITH NAMES ================= */
//     const { data, error } = await supabaseAdmin
//       .from("election_results_snapshot")
//       .select(`
//         position_id,
//         vote_count,
//         is_tie,
//         candidate_user_id,
//         positions:position_id (
//           name
//         ),
//         users:candidate_user_id (
//           name
//         )
//       `)
//       .eq("election_id", electionId)
//       .order("position_id", { ascending: true })
//       .order("vote_count", { ascending: false })

//     if (error) throw error

//     /* ================= FORMAT DATA FOR UI ================= */
//     const formatted = (data ?? []).map((row: any) => ({
//       position_id: row.position_id,
//       position_name: row.positions?.name ?? "Unknown",
//       candidate_user_id: row.candidate_user_id,
//       candidate_name: row.users?.name ?? "Candidate",
//       vote_count: row.vote_count,
//       is_tie: row.is_tie,
//     }))

//     return NextResponse.json(formatted)

//   } catch (err) {
//     console.error("RESULT SNAPSHOT ERROR:", err)

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }



// app/api/admin/results/snapshot/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const electionId = Number(url.searchParams.get("electionId"))

    if (Number.isNaN(electionId)) {
      return NextResponse.json(
        { error: "Invalid electionId" },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // ✅ recompute snapshot
    const { error: computeError } = await supabaseAdmin.rpc(
      "compute_and_snapshot_results",
      { p_election_id: electionId }
    )

    if (computeError) throw computeError

    // ✅ fetch with max_selections
    const { data, error } = await supabaseAdmin
      .from("election_results_snapshot")
      .select(`
        position_id,
        vote_count,
        is_tie,
        candidate_user_id,
        result_type,
        positions:position_id (
          name,
          max_selections
        ),
        users:candidate_user_id (
          name
        )
      `)
      .eq("election_id", electionId)
      .order("position_id", { ascending: true })
      .order("vote_count", { ascending: false })

    if (error) throw error

    const formatted = (data ?? []).map((row: any) => ({
      position_id: row.position_id,
      position_name: row.positions?.name ?? "Unknown",
      max_selections: row.positions?.max_selections ?? 1, // ✅ critical
      candidate_user_id: row.candidate_user_id,
      candidate_name: row.users?.name ?? "Candidate",
      vote_count: row.vote_count,
      is_tie: row.is_tie,
      result_type: row.result_type, // ✅ needed
    }))

    return NextResponse.json(formatted)

  } catch (err) {
    console.error("RESULT SNAPSHOT ERROR:", err)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
