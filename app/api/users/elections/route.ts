// app/api/user/elections/route.ts
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

export async function GET() {
  try {
    /* =========================
       1. AUTH CHECK
       ========================= */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // console.log("Authenticated user:", user)

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userEmail = user.email.toLowerCase()
    

    /* =========================
       2. FETCH ELIGIBLE ELECTIONS
       ========================= */
    const { data, error } = await supabase
      .from("voters")
      .select(`
        election_id,
        elections (
          id,
          title,
          academic_year,
          description,
          status,
          created_at,
          results_published
        )
      `)
      .eq("email", userEmail)
      .eq("is_active", true)

    if (error) {
      throw error
    }

    // console.log("Fetched elections for user:", data)

    

    /* =========================
       3. FLATTEN RESPONSE
       ========================= */
    const elections = data
  .map((row: any) => ({
    ...row.elections,
    id: Number(row.election_id),
  }))
  .filter(Boolean)

    return NextResponse.json(elections)
  } catch (err) {
    console.error("FETCH USER ELECTIONS ERROR:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
