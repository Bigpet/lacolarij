import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

interface IssueDetailProps {
  issueId: string;
  onBack?: () => void;
  jiraUrl?: string;
}

function getSyncStatusBadge(status: Issue["_syncStatus"]) {
  switch (status) {
    case "synced":
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Synced
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "conflict":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
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

export function IssueDetail({ issueId, onBack, jiraUrl }: IssueDetailProps) {
  const issue = useLiveQuery(() => db.issues.get(issueId), [issueId]);
  const comments = useLiveQuery(
    () => db.comments.where("issueId").equals(issueId).toArray(),
    [issueId]
  );

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
        <h2 className="text-2xl font-bold">{issue.summary}</h2>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4">
        <Badge variant={getStatusCategoryVariant(issue.statusCategory)}>
          {issue.status}
        </Badge>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>{renderDescription(issue.description)}</CardContent>
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
