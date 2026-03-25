import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function DashboardHeader() {
  const [name, setName] = useState("User")

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setName(data.user?.user_metadata.full_name || "User")
    }

    loadUser()
  }, [])
  const HandleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg  flex items-center justify-center">
            {/* <span className="text-lg font-bold">AA</span>
             */}
              <img src="/logo.png" alt="IIT BBS Logo" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Alumni Association</h1>
            <p className="text-xs opacity-80">Voting Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm">
            {/* <Link href="/dashboard" className="opacity-80 hover:opacity-100 transition">
              Dashboard
            </Link> */}
            <Link href="/nomination-status" className="opacity-80 hover:opacity-100 transition">
              My Nominations
            </Link>
            {/* <a href="#" className="opacity-80 hover:opacity-100 transition">
              Help
            </a> */}
          </nav>

          <div className="flex items-center gap-3">
            <Button onClick={HandleLogout} variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
              Logout
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-semibold">
              {name.charAt(0)}
            </div>
            
          </div>
        </div>
      </div>
    </header>
  )
}
