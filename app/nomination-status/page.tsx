"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardHeader from "@/components/dashboard/header"
import { Check, Clock, X } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

/* =========================
   TYPES
   ========================= */

interface ApprovalStep {
  step: number
  label: string
  status: "completed" | "pending" | "rejected"
}

interface NominationStatus {
  id: string
  electionName: string
  position: string
  overallStatus: "approved" | "pending" | "rejected"
  approvalSteps: ApprovalStep[]
}

/* =========================
   TIMELINE COMPONENT
   ========================= */

function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="mt-4 space-y-3">
      {steps.map((step, index) => (
        <div key={step.step} className="flex gap-3 items-start">
          {/* Step indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                step.status === "completed"
                  ? "bg-success/10 text-success"
                  : step.status === "rejected"
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.status === "completed" ? (
                <Check className="w-4 h-4" />
              ) : step.status === "rejected" ? (
                <X className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-8 my-1 ${
                  step.status === "completed"
                    ? "bg-success/30"
                    : "bg-muted"
                }`}
              />
            )}
          </div>

          {/* Step content */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">
                {step.label}
              </span>
              <Badge
                className={`badge text-xs ${
                  step.status === "completed"
                    ? "badge-success"
                    : step.status === "rejected"
                    ? "badge-warning"
                    : "badge-muted"
                }`}
              >
                {step.status === "completed"
                  ? "Approved"
                  : step.status === "rejected"
                  ? "Rejected"
                  : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* =========================
   MAIN PAGE
   ========================= */

export default function NominationStatusPage() {
  const [nominations, setNominations] = useState<NominationStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get("/api/users/nominations/status")
      .then((res) => {
        setNominations(res.data)
        console.log("Fetched nominations:", res.data)
      })
      .catch((err) => {
        console.error("Failed to fetch nomination status", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            ← Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Nomination Status
          </h1>
          <p className="text-muted-foreground">
            Track the approval status of your nominations
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">
            Loading nominations…
          </p>
        ) : nominations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            You have not applied for any nominations yet.
          </p>
        ) : (
          <div className="space-y-4">
            {nominations.map((nomination) => (
              <Card
                key={nomination.id}
                className="card-elevated hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {nomination.electionName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Position: {nomination.position}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge
                        className={`badge ${
                          nomination.overallStatus === "approved"
                            ? "badge-success"
                            : nomination.overallStatus === "rejected"
                            ? "badge-warning"
                            : "badge-muted"
                        }`}
                      >
                        {nomination.overallStatus === "approved"
                          ? "Approved"
                          : nomination.overallStatus === "rejected"
                          ? "Rejected"
                          : "In Review"}
                      </Badge>
                    </div>
                  </div>

                  <ApprovalTimeline
                    steps={nomination.approvalSteps}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
