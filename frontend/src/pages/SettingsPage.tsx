import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { JiraConnection, JiraConnectionCreate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

export function SettingsPage() {
  const [connections, setConnections] = useState<JiraConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [jiraUrl, setJiraUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");

  const loadConnections = async () => {
    try {
      const data = await api.listConnections();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const connection: JiraConnectionCreate = {
      name,
      jira_url: jiraUrl,
      email,
      api_token: apiToken,
      is_default: connections.length === 0,
    };

    try {
      await api.createConnection(connection);
      setShowForm(false);
      setName("");
      setJiraUrl("");
      setEmail("");
      setApiToken("");
      loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteConnection(id);
      loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete connection");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>JIRA Connections</CardTitle>
          <CardDescription>
            Manage your JIRA server connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : connections.length === 0 ? (
            <p className="text-muted-foreground">
              No connections configured yet.
            </p>
          ) : (
            <div className="space-y-2">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{conn.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {conn.jira_url} ({conn.email})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(conn.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Work JIRA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jiraUrl">JIRA URL</Label>
                <Input
                  id="jiraUrl"
                  placeholder="https://company.atlassian.net"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  placeholder="Your JIRA API token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Connection</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
