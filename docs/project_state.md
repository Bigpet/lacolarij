# Project State

State: Currently nothing is implemented

past:

* [x] create simple proof of concept (to be discarded later)
* [x] download the REST API docs for JIRA for use in later queries
  * [x] used OpenAPI JIRA v3 spec to generate Markdown files in `./docs/jira/v3`
  * [x] downloaded the JIRA v2 docs as well for JIRA server and generated Markdown files in `./docs/jira/v2`
* [x] create mock JIRA server that can be used to test the frontend v2 and v3
  * [x] create, transition, edit issues, add comments
  * [x] verify tests by running against acutal JIRA server


current:
* [ ] create an architecture documents for the application based on the following lessons from the Proof of Concept:
    * backend:
      * We will need a relay server to forward requests to JIRA (to work around CORS)
      * We want to have a dummy JIRA server implementation for a demo mode
      * We want simple user-management to store settings (no SSO or other fancy things needed, mostly just storing connection settings to JIRA)
    * frontend:
      * SPA typescript application with React
      * Will sync with JIRA through the relay server
      * Will store the state in IndexedDB (images can be cached with CacheStorage)
      * synching conflicts should be able to be manually resolved, no accidental overwriting
      * synching state should be able to be monitored, but never be blocking operation
      * should contain a tasklist with various filters (simple full-text search for now, JQL compatibility later)
      * should be able to render/edit adf descriptions/text including tables (can be done with dependency)
      * should have a detail view for issues
      * should have a status lanes view and quick-filters
    * well tested, including integration tests

* [ ] create simple user account and settings storage backend
* [ ] create SPA local-first frontend
  * [ ] choose local storage method suitable also for large JIRA projects
  * [ ] ... 
