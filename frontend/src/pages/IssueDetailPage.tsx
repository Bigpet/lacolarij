import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IssueDetail } from '@/components/issues';
import { api } from '@/lib/api';
import { db } from '@/lib/db';

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const [jiraUrl, setJiraUrl] = useState<string | undefined>();

  // Get JIRA URL for linking
  useEffect(() => {
    const fetchConnectionUrl = async () => {
      if (!issueId) return;

      // Get the issue to find its project
      const issue = await db.issues.get(issueId);
      if (!issue) return;

      // Get connections and find one that might be for this project
      try {
        const connections = await api.listConnections();
        const defaultConn =
          connections.find((c) => c.is_default) || connections[0];
        if (defaultConn) {
          setJiraUrl(defaultConn.jira_url);
        }
      } catch {
        // Ignore errors
      }
    };

    fetchConnectionUrl();
  }, [issueId]);

  if (!issueId) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No issue selected</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <IssueDetail
        issueId={issueId}
        onBack={() => navigate('/issues')}
        jiraUrl={jiraUrl}
      />
    </div>
  );
}
