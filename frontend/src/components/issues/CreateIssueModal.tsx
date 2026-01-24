/**
 * Modal for creating a new issue locally.
 */

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  issueService,
  type CreateIssueInput,
} from '@/features/issues/issueService';
import type { Issue } from '@/types';
import { Loader2 } from 'lucide-react';

interface CreateIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectKey?: string;
  onIssueCreated?: (issue: Issue) => void;
}

const ISSUE_TYPES = [
  { value: 'Task', label: 'Task' },
  { value: 'Bug', label: 'Bug' },
  { value: 'Story', label: 'Story' },
  { value: 'Epic', label: 'Epic' },
];

/**
 * Convert plain text to Atlassian Document Format (ADF).
 */
function textToAdf(text: string): unknown {
  if (!text.trim()) return null;

  return {
    type: 'doc',
    version: 1,
    content: text.split('\n\n').map((paragraph) => ({
      type: 'paragraph',
      content: paragraph.split('\n').flatMap((line, idx, arr) => {
        const nodes: unknown[] = [{ type: 'text', text: line }];
        if (idx < arr.length - 1) {
          nodes.push({ type: 'hardBreak' });
        }
        return nodes;
      }),
    })),
  };
}

export function CreateIssueModal({
  open,
  onOpenChange,
  defaultProjectKey = '',
  onIssueCreated,
}: CreateIssueModalProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [projectKey, setProjectKey] = React.useState(defaultProjectKey);
  const [issueType, setIssueType] = React.useState('Task');
  const [summary, setSummary] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setProjectKey(defaultProjectKey);
      setIssueType('Task');
      setSummary('');
      setDescription('');
      setError(null);
    }
  }, [open, defaultProjectKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectKey.trim()) {
      setError('Project key is required');
      return;
    }

    if (!summary.trim()) {
      setError('Summary is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const input: CreateIssueInput = {
        projectKey: projectKey.trim().toUpperCase(),
        issueType,
        summary: summary.trim(),
        description: textToAdf(description),
      };

      const issue = await issueService.createIssue(input);

      onIssueCreated?.(issue);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="create-issue-modal">
        <DialogHeader>
          <DialogTitle>Create Issue</DialogTitle>
          <DialogDescription>
            Create a new issue. It will be saved locally and synced when online.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm" data-testid="create-issue-error">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="projectKey">Project Key</Label>
            <Input
              id="projectKey"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              placeholder="e.g., PROJ"
              disabled={isCreating}
              data-testid="create-issue-project-key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type</Label>
            <Select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              options={ISSUE_TYPES}
              disabled={isCreating}
              data-testid="create-issue-type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter a brief summary"
              disabled={isCreating}
              data-testid="create-issue-summary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description"
              rows={4}
              disabled={isCreating}
              data-testid="create-issue-description"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
              data-testid="create-issue-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} data-testid="create-issue-submit">
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
