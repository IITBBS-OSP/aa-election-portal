"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { CenteredLoader } from "@/components/ui/loader"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      const { data, error } = await supabase.auth.getSession()
      console.log("Auth callback data:", data, "error:", error)

      if (error || !data.session?.user) {
        router.replace("/")
        return
      }

      const user = data.session.user
      const email = user.email || ""

      // ✅ DOMAIN RESTRICTION
      // if (!email.endsWith("@iitbbs.ac.in")) {
      //   await supabase.auth.signOut()
      //   alert("Only @iitbbs.ac.in email accounts are allowed.")
      //   router.replace("/")
      //   return
      // }

      // Call backend to save user & get role
      const res = await fetch("/api/auth/post-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      })

      const result = await res.json()
      console.log(result.role)

      // ✅ ROLE-BASED REDIRECT
      if (result.role === "ADMIN" || result.role === "OBSERVER") {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }

    handleAuth()
  }, [router])

  return <CenteredLoader />
}
