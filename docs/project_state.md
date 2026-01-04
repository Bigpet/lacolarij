# Project State

State: Currently nothing is implemented

Current:

* [x] create simple proof of concept (to be discarded)
  * [x] sync changes to existing tasks, change title
  * [x] use jira cloud API for now (later on jira server api option will be added) 

* [x] download the REST API docs for JIRA for use in later queries
  * [x] try to download the documentation in a format that suitable for LLM use
  * [x] used OpenAPI JIRA v3 spec to generate Markdown files in `./docs/jira/v3`
  * [x] downloaded the JIRA v2 docs as well for JIRA server and generated Markdown files in `./docs/jira/v2`

Later:

* [x] create mock JIRA server that can be used to test the frontend v2 and v3
  * [x] create issues
  * [x] transition issues
  * [x] edit description
  * [x] add comments
  * [x] make the tests run on v3 endpoints
  * [x] manual running of the test suite against a test JIRA project to verify parity
* [ ] create simple user account and settings storage backend
* [ ] create SPA local-first frontend
  * [ ] choose local storage method suitable also for large JIRA projects
  * [ ] ... 
