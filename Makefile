.PHONY: test test-real server help

help:
	@echo "test       - Start mock server and run tests"
	@echo "test-real  - Run tests against real JIRA (uses config.toml)"
	@echo "server     - Start the local mock JIRA server"

test:
	@./scripts/run-tests.sh

test-real:
	cd backend && uv run pytest test_jira_api.py -v

server:
	cd backend && uv run uvicorn app.main:app --reload
