/**
 * Conflict resolution modal - shows side-by-side comparison of local and remote versions.
 */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  resolveConflict,
  type ConflictResolution,
} from "@/features/sync/conflictService";
import { type Conflict } from "@/stores/syncStore";
import type { Issue } from "@/types";
import { ExternalLink, Loader2 } from "lucide-react";

interface ConflictResolverProps {
  conflict: Conflict;
  connectionId: string;
  jiraUrl?: string;
  onClose: () => void;
}

function formatTimestamp(ts: number | string): string {
  const date = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">None</span>;
  }

  if (typeof value === "string") {
    return <span className="whitespace-pre-wrap">{value}</span>;
  }

  if (typeof value === "object") {
    // Check if it's an ADF document
    const obj = value as { type?: string; content?: unknown[] };
    if (obj.type === "doc" && Array.isArray(obj.content)) {
      // Extract text from ADF
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
      const text = extractText(obj.content);
      return <span className="whitespace-pre-wrap">{text || "(empty)"}</span>;
    }

    return (
      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span>{String(value)}</span>;
}

export function ConflictResolver({
  conflict,
  connectionId,
  jiraUrl,
  onClose,
}: ConflictResolverProps) {
  const [isResolving, setIsResolving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const localIssue = conflict.localValue as Issue;
  const remoteIssue = conflict.remoteValue as Issue;

  const handleResolve = async (resolution: ConflictResolution) => {
    setIsResolving(true);
    setError(null);
    try {
      await resolveConflict(conflict, resolution, connectionId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolution failed");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Resolve Conflict: {conflict.entityKey || conflict.entityId}
            {jiraUrl && (
              <a
                href={`${jiraUrl}/browse/${conflict.entityKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </DialogTitle>
          <DialogDescription>
            The remote version has changed since you made local edits. Choose
            which version to keep.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Local Version */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="warning">Your Version</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Modified: {formatTimestamp(conflict.localTimestamp)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Summary
                </p>
                <p className="text-sm font-medium">{localIssue.summary}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Status
                </p>
                <Badge variant="outline">{localIssue.status}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <div className="text-sm border rounded p-2 bg-muted/50 max-h-40 overflow-auto">
                  {renderValue(localIssue.description)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remote Version */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="secondary">Server Version</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Modified: {formatTimestamp(conflict.remoteTimestamp)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Summary
                </p>
                <p className="text-sm font-medium">{remoteIssue.summary}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Status
                </p>
                <Badge variant="outline">{remoteIssue.status}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <div className="text-sm border rounded p-2 bg-muted/50 max-h-40 overflow-auto">
                  {renderValue(remoteIssue.description)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleResolve({ type: "keep_remote" })}
            disabled={isResolving}
          >
            Keep Server Version
          </Button>
          <Button
            onClick={() => handleResolve({ type: "keep_local" })}
            disabled={isResolving}
          >
            {isResolving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Keep My Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
