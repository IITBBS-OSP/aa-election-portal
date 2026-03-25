import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabaseServer"


export const metadata: Metadata = {
  title: "Admin Dashboard - Alumni Voting Portal",
  description: "Manage elections and voting processes",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {


  const supabase = await getSupabaseServerClient()
  

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")
    

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()


    console.log("USER PROFILE IN ADMIN LAYOUT:", profile)

    

  if (!profile || !["ADMIN", "OBSERVER"].includes(profile.role)) {
    redirect("/dashboard")
  }



  return (
    <div className="flex h-screen bg-background">
      
      <aside className=" hidden md:flex w-64 border-r border-sidebar-border bg-primary text-sidebar-foreground flex-col">
        <div>
          <div className="p-6 border-b border-sidebar-border/30">
            <h1 className="text-xl font-bold text-sidebar-foreground">Alumni Portal</h1>
            <p className="text-sm text-sidebar-foreground/80">Admin Dashboard</p>
          </div>

          <nav className="space-y-2 px-4 py-6">
            <a
              href="/admin"
              className="block rounded-md px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/admin/elections"
              className="block rounded-md px-4 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              Elections
            </a>
          </nav>
        </div>

        <div className="border-t border-sidebar-border/30 px-4 py-6">
         {profile.role === 'ADMIN' && (
            <Link
              href="/admin/elections/create"
              className="flex w-full items-center justify-center rounded-md bg-sidebar-primary px-4 py-2 text-sm font-medium text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
            >
              + Create Election 
            </Link>
          )}
        </div>

        

        




      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}



 