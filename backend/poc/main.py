# /// script
# dependencies = [
#   "jira",
#   "tomli",
# ]
# ///

import sys
from pathlib import Path

# Add backend directory to path for config import
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from jira import JIRA
from config import load_config


def main():
    try:
        # Load configuration (env vars > config.toml > defaults)
        cfg = load_config()

        print(f"Connecting to Jira at {cfg.url} as {cfg.email} (using API v3)...")

        jira = JIRA(server=cfg.url, basic_auth=(cfg.email, cfg.token))

        myself = jira.myself()
        print(f"Successfully authenticated as: {myself['displayName']} ({myself['emailAddress']})")
        
        # List a few issues to verify further permissions
        print("\nFetching last 3 updated issues for current user:")
        issues = jira.search_issues('assignee = currentUser() order by updated desc', maxResults=3)
        for issue in issues:
            print(f"- {issue.key}: {issue.fields.summary}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
