import { Button } from "@/components/ui/button";
import { IssueList } from "@/components/issues/IssueList";
import { useIssues } from "@/features/issues/useIssues";
import { issueRepository } from "@/lib/db/issueRepository";
import { Plus } from "lucide-react";
import { nanoid } from "nanoid";

export function IssuesPage() {
  const { issues, isLoading } = useIssues();

  const handleAddDebugIssue = async () => {
    await issueRepository.add({
      id: nanoid(),
      key: `TEST-${Math.floor(Math.random() * 1000)}`,
      projectKey: "TEST",
      summary: "This is a local test issue",
      description: null,
      status: "To Do",
      statusCategory: "todo",
      assignee: "Me",
      reporter: "Me",
      priority: "Medium",
      issueType: "Task",
      labels: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      _localUpdated: Date.now(),
      _syncStatus: "pending",
      _syncError: null,
      _remoteVersion: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Issues</h1>
        <Button onClick={handleAddDebugIssue} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Debug: Add Issue
        </Button>
      </div>

      <IssueList issues={issues || []} isLoading={isLoading} />
    </div>
  );
}
