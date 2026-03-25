import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VoteConfirmationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="card-elevated w-full max-w-md">
        <CardHeader className="text-center bg-success/5 border-b border-border">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-3xl text-success">✓</span>
            </div>
          </div>
          <CardTitle className="text-success text-2xl">Vote Submitted Successfully</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-foreground font-semibold">Thank you for voting!</p>
            <p className="text-sm text-muted-foreground">
              Your vote has been recorded securely and counted in the final tally. Results will be announced after the
              voting period closes.
            </p>
          </div>

          <div className="p-4 bg-secondary/30 rounded-md space-y-2">
            <p className="text-xs text-muted-foreground font-semibold">VOTE REFERENCE</p>
            <p className="text-lg font-mono text-foreground">VT-2025-GS-7382</p>
            <p className="text-xs text-muted-foreground">Keep this reference for your records</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Elections are scheduled to close on January 15, 2025</p>
            <p>• Results will be announced within 24 hours</p>
            <p>• You will receive an email confirmation</p>
          </div>

          <Link href="/dashboard" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
