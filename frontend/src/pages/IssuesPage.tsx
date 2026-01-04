import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function IssuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Issues</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No issues yet. Connect to JIRA and sync to see your issues here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
