import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get started by adding a JIRA connection in Settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No issues synced yet. Connect to JIRA to start syncing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Not connected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
