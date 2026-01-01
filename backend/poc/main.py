# /// script
# dependencies = [
#   "jira",
# ]
# ///

import os
from jira import JIRA

def read_file(path):
    try:
        with open(path, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"Error: File not found at {path}")
        return None

def main():
    try:
        # Determine the project root directory relative to this script
        # Script is in backend/poc/main.py, so root is ../../..
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(script_dir))
        
        token_path = os.path.join(project_root, 'JIRA_TOKEN.txt')
        url_path = os.path.join(project_root, 'JIRA_URL.txt')
        email_path = os.path.join(project_root, 'JIRA_EMAIL.txt')

        print(f"Reading configuration from {project_root}...")
        
        token = read_file(token_path)
        url = read_file(url_path)
        email = read_file(email_path)

        if not all([token, url, email]):
             print("Missing configuration files.")
             return

        # Sanitize inputs
        if token: token = token.strip().rstrip('.')
        if email: email = email.strip().rstrip('.')
        if url: 
            url = url.strip().rstrip('.')
            # Fix for Jira Cloud which usually doesn't use /jira context path
            if 'atlassian.net' in url and url.endswith('/jira'):
                print("Note: Removing '/jira' suffix from URL for Jira Cloud compatibility.")
                url = url[:-5]

        print(f"Connecting to Jira at {url} as {email} (using API v3)...")

        jira = JIRA(server=url, basic_auth=(email, token)) # jira-python usually targets v2/v3 automatically for Cloud

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
