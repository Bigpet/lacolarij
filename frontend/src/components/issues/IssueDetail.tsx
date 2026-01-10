import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { api, type JiraTransition } from "@/lib/api";
import { issueService } from "@/features/issues/issueService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Issue } from "@/types";
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Pencil,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface IssueDetailProps {
  issueId: string;
  connectionId?: string;
  onBack?: () => void;
  jiraUrl?: string;
}

function getSyncStatusBadge(status: Issue["_syncStatus"]) {
  switch (status) {
    case "synced":
      return (
        <Badge variant="success" className="flex items-center gap-1" data-testid="sync-status-badge">
          <CheckCircle className="h-3 w-3" />
          Synced
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" className="flex items-center gap-1" data-testid="sync-status-badge">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "conflict":
      return (
        <Badge variant="destructive" className="flex items-center gap-1" data-testid="sync-status-badge">
          <AlertCircle className="h-3 w-3" />
          Conflict
        </Badge>
      );
  }
}

function getStatusCategoryVariant(
  category: "todo" | "indeterminate" | "done"
): "info" | "warning" | "success" {
  switch (category) {
    case "todo":
      return "info";
    case "indeterminate":
      return "warning";
    case "done":
      return "success";
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderDescription(description: unknown): React.ReactNode {
  if (!description) {
    return (
      <p className="text-muted-foreground italic">No description provided</p>
    );
  }

  // If it's an ADF document, try to render it as simple text for now
  if (typeof description === "object" && description !== null) {
    const adf = description as { type?: string; content?: unknown[] };
    if (adf.type === "doc" && Array.isArray(adf.content)) {
      return (
        <div className="prose prose-sm max-w-none">
          {renderAdfContent(adf.content)}
        </div>
      );
    }
  }

  // Plain text fallback
  if (typeof description === "string") {
    return <p className="whitespace-pre-wrap">{description}</p>;
  }

  return (
    <pre className="text-sm bg-muted p-2 rounded overflow-auto">
      {JSON.stringify(description, null, 2)}
    </pre>
  );
}

function renderAdfContent(content: unknown[]): React.ReactNode[] {
  return content.map((node, index) => {
    if (typeof node !== "object" || node === null) return null;

    const n = node as {
      type: string;
      content?: unknown[];
      text?: string;
      attrs?: Record<string, unknown>;
    };

    switch (n.type) {
      case "paragraph":
        return (
          <p key={index}>
            {n.content ? renderAdfContent(n.content) : null}
          </p>
        );
      case "text":
        return <span key={index}>{n.text}</span>;
      case "heading":
        const level = (n.attrs?.level as number) || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index}>
            {n.content ? renderAdfContent(n.content) : null}
          </HeadingTag>
        );
      case "bulletList":
        return (
          <ul key={index}>
            {n.content ? renderAdfContent(n.content) : null}
          </ul>
        );
      case "orderedList":
        return (
          <ol key={index}>
            {n.content ? renderAdfContent(n.content) : null}
          </ol>
        );
      case "listItem":
        return (
          <li key={index}>
            {n.content ? renderAdfContent(n.content) : null}
          </li>
        );
      case "codeBlock":
        return (
          <pre key={index} className="bg-muted p-2 rounded">
            <code>{n.content ? renderAdfContent(n.content) : null}</code>
          </pre>
        );
      case "blockquote":
        return (
          <blockquote key={index} className="border-l-4 border-muted pl-4">
            {n.content ? renderAdfContent(n.content) : null}
          </blockquote>
        );
      default:
        return (
          <span key={index}>
            {n.content ? renderAdfContent(n.content) : n.text || ""}
          </span>
        );
    }
  });
}

// Map status category key to our simplified category
function mapStatusCategoryKey(key: string): "todo" | "indeterminate" | "done" {
  switch (key.toLowerCase()) {
    case "new":
    case "undefined":
      return "todo";
    case "done":
      return "done";
    default:
      return "indeterminate";
  }
}

export function IssueDetail({
  issueId,
  connectionId,
  onBack,
  jiraUrl,
}: IssueDetailProps) {
  const issue = useLiveQuery(() => db.issues.get(issueId), [issueId]);
  const comments = useLiveQuery(
    () => db.comments.where("issueId").equals(issueId).sortBy("created"),
    [issueId]
  );

  // Editing state
  const [isEditingSummary, setIsEditingSummary] = React.useState(false);
  const [editedSummary, setEditedSummary] = React.useState("");
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [editedDescription, setEditedDescription] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Status transitions
  const [transitions, setTransitions] = React.useState<JiraTransition[]>([]);
  const [isLoadingTransitions, setIsLoadingTransitions] = React.useState(false);

  // Load transitions when connection is available
  React.useEffect(() => {
    if (connectionId && issue) {
      setIsLoadingTransitions(true);
      api
        .getTransitions(connectionId, issue.key)
        .then((result) => setTransitions(result.transitions))
        .catch((err) => console.error("Failed to load transitions:", err))
        .finally(() => setIsLoadingTransitions(false));
    }
  }, [connectionId, issue?.key]);

  const handleSaveSummary = async () => {
    if (!issue || !editedSummary.trim()) return;
    setIsSaving(true);
    try {
      await issueService.updateSummary(issue.id, editedSummary.trim());
      setIsEditingSummary(false);
    } catch (error) {
      console.error("Failed to save summary:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!issue) return;
    setIsSaving(true);
    try {
      // Store as simple ADF document
      const adfDescription = editedDescription.trim()
        ? {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: editedDescription.trim() }],
              },
            ],
          }
        : null;
      await issueService.updateDescription(issue.id, adfDescription);
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Failed to save description:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (transitionId: string) => {
    if (!issue || !connectionId) return;
    const transition = transitions.find((t) => t.id === transitionId);
    if (!transition) return;

    try {
      await issueService.transitionIssue(issue.id, transitionId, {
        name: transition.to.name,
        category: mapStatusCategoryKey(transition.to.statusCategory.key),
      });
    } catch (error) {
      console.error("Failed to transition issue:", error);
    }
  };

  const startEditSummary = () => {
    if (issue) {
      setEditedSummary(issue.summary);
      setIsEditingSummary(true);
    }
  };

  const startEditDescription = () => {
    if (issue) {
      // Extract text from ADF if possible
      const desc = issue.description;
      if (typeof desc === "string") {
        setEditedDescription(desc);
      } else if (
        desc &&
        typeof desc === "object" &&
        "content" in desc &&
        Array.isArray((desc as { content: unknown[] }).content)
      ) {
        // Try to extract text from ADF
        const extractText = (content: unknown[]): string => {
          return content
            .map((node) => {
              if (typeof node !== "object" || node === null) return "";
              const n = node as { type: string; text?: string; content?: unknown[] };
              if (n.type === "text") return n.text || "";
              if (n.content) return extractText(n.content);
              return "";
            })
            .join("");
        };
        setEditedDescription(extractText((desc as { content: unknown[] }).content));
      } else {
        setEditedDescription("");
      }
      setIsEditingDescription(true);
    }
  };

  if (!issue) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Issue not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {getSyncStatusBadge(issue._syncStatus)}
          {jiraUrl && (
            <a
              href={`${jiraUrl}/browse/${issue.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Open in JIRA
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Issue key and summary */}
      <div>
        <h1 className="text-sm font-mono text-primary mb-2">{issue.key}</h1>
        {isEditingSummary ? (
          <div className="flex items-center gap-2">
            <Input
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="text-xl font-bold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveSummary();
                if (e.key === "Escape") setIsEditingSummary(false);
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveSummary}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditingSummary(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h2
            className="text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 group"
            onClick={startEditSummary}
          >
            {issue.summary}
            <Pencil className="inline-block h-4 w-4 ml-2 opacity-0 group-hover:opacity-50" />
          </h2>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status dropdown */}
        {connectionId && transitions.length > 0 ? (
          <Select
            value=""
            onChange={(e) => handleStatusChange(e.target.value)}
            options={transitions.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
            placeholder={issue.status}
            className="w-40"
            disabled={isLoadingTransitions}
            data-testid="status-select"
          />
        ) : (
          <Badge variant={getStatusCategoryVariant(issue.statusCategory)} data-testid="status-badge">
            {issue.status}
          </Badge>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="issue-type">
          <Tag className="h-4 w-4" />
          {issue.issueType}
        </div>

        {issue.priority && (
          <div className="text-sm text-muted-foreground">
            Priority: {issue.priority}
          </div>
        )}
      </div>

      {/* People */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Assignee:</span>
          <span>{issue.assignee || "Unassigned"}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Reporter:</span>
          <span>{issue.reporter}</span>
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Created: {formatDate(issue.created)}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Updated: {formatDate(issue.updated)}
        </div>
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Labels:</span>
          <div className="flex gap-1">
            {issue.labels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Description</CardTitle>
          {!isEditingDescription && (
            <Button variant="ghost" size="sm" onClick={startEditDescription}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingDescription ? (
            <div className="space-y-2">
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="min-h-[200px]"
                placeholder="Enter description..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveDescription}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingDescription(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            renderDescription(issue.description)
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>
            Comments {comments?.length ? `(${comments.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!comments || comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.created)}
                    </span>
                  </div>
                  <div className="text-sm">{renderDescription(comment.body)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
