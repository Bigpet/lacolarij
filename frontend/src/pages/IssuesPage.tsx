import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueList, CreateIssueModal } from '@/components/issues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSync } from '@/features/sync/syncEngine';
import { api } from '@/lib/api';
import { issueRepository } from '@/lib/db';
import type { Issue, JiraConnection } from '@/types';
import { RefreshCw, Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function IssuesPage() {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [connections, setConnections] = useState<JiraConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultProjectKey, setDefaultProjectKey] = useState('');

  const { sync, status: syncStatus } = useSync();

  // Get default project key from existing issues
  useEffect(() => {
    const loadDefaultProjectKey = async () => {
      const issues = await issueRepository.getAll();
      if (issues.length > 0) {
        // Use the most common project key
        const projectCounts: Record<string, number> = {};
        for (const issue of issues) {
          if (!issue.projectKey.startsWith('LOCAL')) {
            projectCounts[issue.projectKey] =
              (projectCounts[issue.projectKey] || 0) + 1;
          }
        }
        const sorted = Object.entries(projectCounts).sort(
          (a, b) => b[1] - a[1]
        );
        if (sorted.length > 0) {
          setDefaultProjectKey(sorted[0][0]);
        }
      }
    };
    loadDefaultProjectKey();
  }, []);

  // Load connections on mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const conns = await api.listConnections();
        setConnections(conns);
        // Auto-select default or first connection
        const defaultConn = conns.find((c) => c.is_default) || conns[0];
        if (defaultConn) {
          setSelectedConnectionId(defaultConn.id);
        }
      } catch (error) {
        console.error('Failed to load connections:', error);
      } finally {
        setIsLoadingConnections(false);
      }
    };
    loadConnections();
  }, []);

  const handleIssueSelect = useCallback(
    (issue: Issue) => {
      setSelectedIssue(issue);
      navigate(`/issues/${issue.id}`);
    },
    [navigate]
  );

  const handleIssueCreated = useCallback(
    (issue: Issue) => {
      // Navigate to the newly created issue
      navigate(`/issues/${issue.id}`);
    },
    [navigate]
  );

  const handleRefresh = useCallback(async () => {
    if (!selectedConnectionId) return;
    await sync({
      connectionId: selectedConnectionId,
      fullSync: false,
    });
  }, [selectedConnectionId, sync]);

  const handleFullSync = useCallback(async () => {
    if (!selectedConnectionId) return;
    await sync({
      connectionId: selectedConnectionId,
      fullSync: true,
    });
  }, [selectedConnectionId, sync]);

  const isSyncing = syncStatus === 'syncing';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Issues</h1>

        <div className="flex items-center gap-2">
          {/* Connection selector */}
          {connections.length > 0 && (
            <select
              value={selectedConnectionId || ''}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              disabled={isSyncing}
            >
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.name}
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="create-issue-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!selectedConnectionId || isSyncing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`}
            />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFullSync}
            disabled={!selectedConnectionId || isSyncing}
          >
            Full Sync
          </Button>
        </div>
      </div>

      {/* No connections warning */}
      {!isLoadingConnections && connections.length === 0 && (
        <Card data-testid="no-connections-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No JIRA connections configured. Add a connection to start
                syncing issues.
              </p>
              <Link to="/settings">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue list */}
      {(connections.length > 0 || !isLoadingConnections) && (
        <Card>
          <CardHeader>
            <CardTitle>Issue List</CardTitle>
          </CardHeader>
          <CardContent>
            <IssueList
              onIssueSelect={handleIssueSelect}
              selectedIssueId={selectedIssue?.id}
              onRefresh={handleRefresh}
              isLoading={isSyncing}
            />
          </CardContent>
        </Card>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultProjectKey={defaultProjectKey}
        onIssueCreated={handleIssueCreated}
      />
    </div>
  );
}
