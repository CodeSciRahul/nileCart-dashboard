import { DashboardLayout } from "@/components/layout/DashboardLayout.jsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Wallet } from "lucide-react";

function PayoutsPage() {
  return (
    <DashboardLayout title="Payouts" variant="admin">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Payouts — Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm leading-relaxed">
          Seller payout tracking and commission settlement will be available in a future
          release. This will include earnings summaries, payout history, and admin tools to
          mark payouts as processed.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default function Payouts() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <PayoutsPage />
    </ProtectedRoute>
  );
}
