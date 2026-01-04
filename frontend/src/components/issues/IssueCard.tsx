import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertCircle,
    CheckCircle2,
    HelpCircle,
    User
} from "lucide-react";
import type { Issue } from "@/types";

interface IssueCardProps {
    issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
    const navigate = useNavigate();

    const getStatusColor = (category: string) => {
        switch (category) {
            case "done":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "indeterminate":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            default:
                return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
        }
    };

    const getTypeIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("bug")) return <AlertCircle className="h-4 w-4 text-red-500" />;
        if (t.includes("story")) return <CheckCircle2 className="h-4 w-4 text-green-500" />; // Just a placeholder
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
    };

    return (
        <Card
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => navigate(`/issues/${issue.id}`)}
        >
            <CardContent className="p-4 flex items-center gap-4">
                {/* Type Icon */}
                <div className="shrink-0">
                    {getTypeIcon(issue.issueType)}
                </div>

                {/* Key */}
                <div className="shrink-0 w-24 text-sm font-medium text-muted-foreground">
                    {issue.key}
                </div>

                {/* Summary */}
                <div className="flex-1 font-medium truncate">
                    {issue.summary}
                </div>

                {/* Assignee */}
                <div className="shrink-0 w-32 flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="truncate">{issue.assignee || "Unassigned"}</span>
                </div>

                {/* Status */}
                <div className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.statusCategory)}`}>
                    {issue.status}
                </div>
            </CardContent>
        </Card>
    );
}
