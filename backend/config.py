import os
from dataclasses import dataclass
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib


@dataclass
class JiraConfig:
    url: str
    email: str
    token: str
    project_key: str
    api_version: str


def load_config(config_path: Path | None = None) -> JiraConfig:
    """Load JIRA configuration from environment variables, config file, or defaults.

    Priority: environment variables > config file > defaults

    Args:
        config_path: Optional path to config.toml. Defaults to project root.

    Returns:
        JiraConfig with loaded values.
    """
    # Defaults for local mock server
    defaults = {
        "url": "http://localhost:8000",
        "email": "dummy@example.com",
        "token": "dummy_token",
        "project_key": "TEST",
        "api_version": "3",
    }

    # Determine config file path
    if config_path is None:
        config_path = Path(__file__).parent.parent / "config.toml"

    # Try to load from config file
    file_config: dict = {}
    if config_path.exists():
        with open(config_path, "rb") as f:
            data = tomllib.load(f)
            file_config = data.get("jira", {})

    # Merge: defaults < file < env vars
    return JiraConfig(
        url=os.environ.get("JIRA_URL", file_config.get("url", defaults["url"])),
        email=os.environ.get("JIRA_EMAIL", file_config.get("email", defaults["email"])),
        token=os.environ.get(
            "JIRA_PASSWORD", file_config.get("token", defaults["token"])
        ),
        project_key=os.environ.get(
            "JIRA_PROJECT_KEY", file_config.get("project_key", defaults["project_key"])
        ),
        api_version=os.environ.get(
            "JIRA_API_VERSION", file_config.get("api_version", defaults["api_version"])
        ),
    )
