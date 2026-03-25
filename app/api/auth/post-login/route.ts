// import { NextResponse } from "next/server"
// import { supabaseAdmin } from "@/lib/supabaseAdmin"

// export async function POST(req: Request) {
//   const { user } = await req.json()

//   if (!user?.id || !user?.email) {
//     return NextResponse.json(
//       { error: "Invalid user data" },
//       { status: 400 }
//     )
//   }

//   // Check if user exists in our users table
//   const { data: existingUser } = await supabaseAdmin
//     .from("users")
//     .select("id, role")
//     .eq("id", user.id)
//     .single()

//   // First login → create user
//   if (!existingUser) {
//     const { data: newUser, error } = await supabaseAdmin
//       .from("users")
//       .insert({
//         id: user.id,
//         name: user.user_metadata.full_name || "",
//         email: user.email,
//         role: "VOTER", // default role
//       })
//       .select("role")
//       .single()

//     if (error) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({ role: newUser.role })
//   }

//   // Existing user
//   return NextResponse.json({ role: existingUser.role })
// }



import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const { user } = await req.json()

  if (!user?.id || !user?.email) {
    return NextResponse.json(
      { error: "Invalid user data" },
      { status: 400 }
    )
  }

  // -------- ROLE MAPPING --------
  const roleMap: Record<string, string> = {
    "secretary.aa@iitbbs.ac.in": "ADMIN",
    "president.aa@iitbbs.ac.in": "PRESIDENT",
    "webadmin.aa@iitbbs.ac.in": "OBSERVER",
  }

  // Decide role based on email
  const assignedRole =
    roleMap[user.email.toLowerCase()] || "VOTER"

  // Check if user exists
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single()

  // -------- FIRST LOGIN --------
  if (!existingUser) {
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        id: user.id,
        name: user.user_metadata?.full_name || "",
        email: user.email,
        role: assignedRole, // ← dynamic role assignment
      })
      .select("role")
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ role: newUser.role })
  }

  // -------- EXISTING USER --------
  return NextResponse.json({ role: existingUser.role })
}

