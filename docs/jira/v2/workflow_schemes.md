# Workflow schemes

This resource represents workflow schemes. Use it to manage workflow schemes and the workflow scheme's workflows and issue types.

A workflow scheme maps issue types to workflows. A workflow scheme can be associated with one or more projects, which enables the projects to use the workflow-issue type mappings.

Active workflow schemes (workflow schemes that are used by projects) cannot be edited. When an active workflow scheme is edited, a draft copy of the scheme is created. The draft workflow scheme is then be edited and published (replacing the active scheme).

See [Configuring workflow schemes](https://confluence.atlassian.com/x/tohKLg) for more information.

## Get all workflow schemes

`GET /rest/api/2/workflowscheme`

Returns a [paginated](#pagination) list of all workflow schemes, not including draft workflow schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Create workflow scheme

`POST /rest/api/2/workflowscheme`

Creates a workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowScheme" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Switch workflow scheme for project

`POST /rest/api/2/workflowscheme/project/switch`

Switches a workflow scheme for a project.

Workflow schemes can only be assigned to classic projects.

**Calculating required mappings:** If statuses from the current workflow scheme won't exist in the target workflow scheme, you must provide `mappingsByIssueTypeOverride` to specify how issues with those statuses should be migrated. Use [the required workflow scheme mappings API](#api-rest-api-3-workflowscheme-update-mappings-post) to determine which statuses and issue types require mappings.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowSchemeProjectSwitchBean" }
```

### Responses

- **303**: Returned if the request is successful and the task has been started.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **409**: Returned if another workflow scheme switch task is already running.

---

## Bulk get workflow schemes

`POST /rest/api/2/workflowscheme/read`

Returns a list of workflow schemes by providing workflow scheme IDs or project IDs.

**[Permissions](#permissions) required:**

 *  *Administer Jira* global permission to access all, including project-scoped, workflow schemes
 *  *Administer projects* project permissions to access project-scoped workflow schemes

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowSchemeReadRequest" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.

---

## Update workflow scheme

`POST /rest/api/2/workflowscheme/update`

Updates company-managed and team-managed project workflow schemes. This API doesn't have a concept of draft, so any changes made to a workflow scheme are immediately available. When changing the available statuses for issue types, an [asynchronous task](#async) migrates the issues as defined in the provided mappings.

**[Permissions](#permissions) required:**

 *  *Administer Jira* project permission to update all, including global-scoped, workflow schemes.
 *  *Administer projects* project permission to update project-scoped workflow schemes.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowSchemeUpdateRequest" }
```

### Responses

- **200**: Returned if the request is successful and there is no asynchronous task.
- **303**: Returned if the request is successful and there is an asynchronous task for the migrations.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **409**: Returned if another workflow configuration update task is ongoing.

---

## Get required status mappings for workflow scheme update

`POST /rest/api/2/workflowscheme/update/mappings`

Gets the required status mappings for the desired changes to a workflow scheme. The results are provided per issue type and workflow. When updating a workflow scheme, status mappings can be provided per issue type, per workflow, or both.

**[Permissions](#permissions) required:**

 *  *Administer Jira* permission to update all, including global-scoped, workflow schemes.
 *  *Administer projects* project permission to update project-scoped workflow schemes.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowSchemeUpdateRequiredMappingsRequest" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.

---

## Delete workflow scheme

`DELETE /rest/api/2/workflowscheme/{id}`

Deletes a workflow scheme. Note that a workflow scheme cannot be deleted if it is active (that is, being used by at least one project).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme. Find this ID by editing the desired workflow scheme in Jira. The ID is shown in the URL as `schemeId`. For example, *schemeId=10301*.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the scheme is active.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme is not found.

---

## Get workflow scheme

`GET /rest/api/2/workflowscheme/{id}`

Returns a workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme. Find this ID by editing the desired workflow scheme in Jira. The ID is shown in the URL as `schemeId`. For example, *schemeId=10301*.
- **returnDraftIfExists** (query): Returns the workflow scheme's draft rather than scheme itself, if set to true. If the workflow scheme does not have a draft, then the workflow scheme is returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme is not found.

---

## Classic update workflow scheme

`PUT /rest/api/2/workflowscheme/{id}`

Updates a company-manged project workflow scheme, including the name, default workflow, issue type to project mappings, and more. If the workflow scheme is active (that is, being used by at least one project), then a draft workflow scheme is created or updated instead, provided that `updateDraftIfNeeded` is set to `true`.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme. Find this ID by editing the desired workflow scheme in Jira. The ID is shown in the URL as `schemeId`. For example, *schemeId=10301*.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowScheme" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme is not found.

---

## Delete default workflow

`DELETE /rest/api/2/workflowscheme/{id}/default`

Resets the default workflow for a workflow scheme. That is, the default workflow is set to Jira's system workflow (the *jira* workflow).

Note that active workflow schemes cannot be edited. If the workflow scheme is active, set `updateDraftIfNeeded` to `true` and a draft workflow scheme is created or updated with the default workflow reset. The draft workflow scheme can be published in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **updateDraftIfNeeded** (query): Set to true to create or update the draft of a workflow scheme and delete the mapping from the draft, when the workflow scheme cannot be edited. Defaults to `false`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the workflow scheme cannot be edited and `updateDraftIfNeeded` is not `true`.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme is not found.

---

## Get default workflow

`GET /rest/api/2/workflowscheme/{id}/default`

Returns the default workflow for a workflow scheme. The default workflow is the workflow that is assigned any issue types that have not been mapped to any other workflow. The default workflow has *All Unassigned Issue Types* listed in its issue types for the workflow scheme in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **returnDraftIfExists** (query): Set to `true` to return the default workflow for the workflow scheme's draft rather than scheme itself. If the workflow scheme does not have a draft, then the default workflow for the workflow scheme is returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme is not found.

---

## Update default workflow

`PUT /rest/api/2/workflowscheme/{id}/default`

Sets the default workflow for a workflow scheme.

Note that active workflow schemes cannot be edited. If the workflow scheme is active, set `updateDraftIfNeeded` to `true` in the request object and a draft workflow scheme is created or updated with the new default workflow. The draft workflow scheme can be published in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DefaultWorkflow" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the workflow scheme cannot be edited and `updateDraftIfNeeded` is not `true`.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme is not found.

---

## Delete workflow for issue type in workflow scheme

`DELETE /rest/api/2/workflowscheme/{id}/issuetype/{issueType}`

Deletes the issue type-workflow mapping for an issue type in a workflow scheme.

Note that active workflow schemes cannot be edited. If the workflow scheme is active, set `updateDraftIfNeeded` to `true` and a draft workflow scheme is created or updated with the issue type-workflow mapping deleted. The draft workflow scheme can be published in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **issueType** (path): The ID of the issue type.
- **updateDraftIfNeeded** (query): Set to true to create or update the draft of a workflow scheme and update the mapping in the draft, when the workflow scheme cannot be edited. Defaults to `false`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the workflow cannot be edited and `updateDraftIfNeeded` is false.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme or issue type is not found.

---

## Get workflow for issue type in workflow scheme

`GET /rest/api/2/workflowscheme/{id}/issuetype/{issueType}`

Returns the issue type-workflow mapping for an issue type in a workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **issueType** (path): The ID of the issue type.
- **returnDraftIfExists** (query): Returns the mapping from the workflow scheme's draft rather than the workflow scheme, if set to true. If no draft exists, the mapping from the workflow scheme is returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme or issue type is not found.

---

## Set workflow for issue type in workflow scheme

`PUT /rest/api/2/workflowscheme/{id}/issuetype/{issueType}`

Sets the workflow for an issue type in a workflow scheme.

Note that active workflow schemes cannot be edited. If the workflow scheme is active, set `updateDraftIfNeeded` to `true` in the request body and a draft workflow scheme is created or updated with the new issue type-workflow mapping. The draft workflow scheme can be published in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **issueType** (path): The ID of the issue type.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueTypeWorkflowMapping" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the workflow cannot be edited and `updateDraftIfNeeded` is false.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme or issue type is not found.

---

## Delete issue types for workflow in workflow scheme

`DELETE /rest/api/2/workflowscheme/{id}/workflow`

Deletes the workflow-issue type mapping for a workflow in a workflow scheme.

Note that active workflow schemes cannot be edited. If the workflow scheme is active, set `updateDraftIfNeeded` to `true` and a draft workflow scheme is created or updated with the workflow-issue type mapping deleted. The draft workflow scheme can be published in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **workflowName** (query): The name of the workflow.
- **updateDraftIfNeeded** (query): Set to true to create or update the draft of a workflow scheme and delete the mapping from the draft, when the workflow scheme cannot be edited. Defaults to `false`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the workflow cannot be edited and `updateDraftIfNeeded` is not true.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow is not found.
 *  The workflow is not specified.

---

## Get issue types for workflows in workflow scheme

`GET /rest/api/2/workflowscheme/{id}/workflow`

Returns the workflow-issue type mappings for a workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **workflowName** (query): The name of a workflow in the scheme. Limits the results to the workflow-issue type mapping for the specified workflow.
- **returnDraftIfExists** (query): Returns the mapping from the workflow scheme's draft rather than the workflow scheme, if set to true. If no draft exists, the mapping from the workflow scheme is returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if either the workflow scheme or workflow is not found.

---

## Set issue types for workflow in workflow scheme

`PUT /rest/api/2/workflowscheme/{id}/workflow`

Sets the issue types for a workflow in a workflow scheme. The workflow can also be set as the default workflow for the workflow scheme. Unmapped issues types are mapped to the default workflow.

Note that active workflow schemes cannot be edited. If the workflow scheme is active, set `updateDraftIfNeeded` to `true` in the request body and a draft workflow scheme is created or updated with the new workflow-issue types mappings. The draft workflow scheme can be published in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme.
- **workflowName** (query): The name of the workflow.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueTypesWorkflowMapping" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow is not found.
 *  The workflow is not specified.

---

## Get projects which are using a given workflow scheme

`GET /rest/api/2/workflowscheme/{workflowSchemeId}/projectUsages`

Returns a page of projects using a given workflow scheme.

### Parameters

- **workflowSchemeId** (path): The workflow scheme ID
- **nextPageToken** (query): The cursor for pagination
- **maxResults** (query): The maximum number of results to return. Must be an integer between 1 and 200.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **404**: Returned if the workflow scheme with the given ID does not exist.

---

