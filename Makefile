.PHONY: test test-local test-real server help

help:
	@echo "Available targets:"
	@echo "  test-local  - Run tests against local mock server (default)"
	@echo "  test-real   - Run tests against real JIRA (uses config.toml)"
	@echo "  server      - Start the local mock JIRA server"
	@echo "  test        - Alias for test-local"

# Run tests against local mock server (ignores config.toml)
test-local:
	cd backend && JIRA_URL=http://localhost:8000 \
		JIRA_EMAIL=dummy@example.com \
		JIRA_PASSWORD=dummy_token \
		JIRA_PROJECT_KEY=TEST \
		JIRA_API_VERSION=2 \
		uv run pytest test_jira_api.py -v

# Run tests against real JIRA instance (uses config.toml)
test-real:
	cd backend && uv run pytest test_jira_api.py -v

# Alias for test-local
test: test-local

# Start the local mock JIRA server
server:
	cd backend && uv run uvicorn main:app --reload
