import { useLiveQuery } from "dexie-react-hooks";
import { issueRepository } from "@/lib/db/issueRepository";

export function useIssues(searchQuery: string = "") {
    // If we had more complex filters, we would pass them here
    const issues = useLiveQuery(
        () => {
            if (searchQuery) {
                return issueRepository.search(searchQuery);
            }
            return issueRepository.getAll();
        },
        [searchQuery]
    );

    return {
        issues,
        isLoading: issues === undefined,
    };
}

export function useIssue(id: string) {
    const issue = useLiveQuery(
        () => issueRepository.getById(id),
        [id]
    );

    return {
        issue,
        isLoading: issue === undefined
    };
}
