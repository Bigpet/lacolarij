
### Future Migration Strategy

When the schema stabilizes and production deployments require zero-downtime migrations, Alembic will be integrated:

```bash
# Initialize Alembic (when needed)
uv run alembic init alembic

# Generate initial migration
uv run alembic revision --autogenerate -m "Initial"

# Apply migrations
uv run alembic upgrade head
```


* Add a Test-Connection button to the JIRA connection settings page
* Sync up fails with "415 Unsupported Media Type"
* seperate projects/connections

