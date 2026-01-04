import { Issue } from "@/types";
import { IssueCard } from "./IssueCard";

interface IssueListProps {
    issues: Issue[];
    isLoading?: boolean;
}

export function IssueList({ issues, isLoading }: IssueListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (issues.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                <p>No issues found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
            ))}
        </div>
    );
}
