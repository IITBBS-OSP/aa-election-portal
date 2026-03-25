import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ElectionDetails } from "@/app/dashboard/page"

// interface Election {
//   id: number
//   title: string
//   status: "ongoing" | "upcoming"
//   deadline: string
//   type: string
//   action: string
//   href: string
// }

export default function ElectionCard({ election }: { election: ElectionDetails }) {
  const statusBadgeColor =
    election.status === "NOMINATION" || election.status === "VOTING" ? "badge-success" : "badge-warning"

  return (
    <Card className="card-elevated transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {election.title}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
               {election.academic_year}
            </p>
          </div>

          <Badge
            className={`badge ${statusBadgeColor} shrink-0 rounded-md px-2 py-0.5 text-xs`}
          >
            {election.status === "NOMINATION" || election.status === "VOTING"||election.status==="CAMPAIGN" ? "Active" : election.status === "RESULTS_PUBLISHED" ? "Completed" : "Upcoming"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium text-foreground">
            {election.status}
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <Link href={election.status === "NOMINATION" || election.status === "DRAFT"||election.status==="CAMPAIGN" ? `/election/${election.id}` : election.status === "VOTING" ? `/vote/${election.id}` : `/election/${election.id}/result`}>
            <Button
              size="sm"
              variant={election.status === "NOMINATION" || election.status === "VOTING" ? "default" : "outline"}
            >
              {election.results_published ? "View Results" : election.status === "COMPLETED" ? "Results Pending" :election.status==="NOMINATION" ? "Participate Now" : election.status==="DRAFT" ? "View Details":election.status==="VOTING" ? "Vote Now":election.status==="CAMPAIGN" ? "View Details" : "-"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
