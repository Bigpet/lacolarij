import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Board</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Done</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No issues</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
