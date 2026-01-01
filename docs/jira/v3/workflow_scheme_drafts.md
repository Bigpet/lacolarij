# Workflow scheme drafts

This resource represents draft workflow schemes. Use it to manage drafts of workflow schemes.

A workflow scheme maps issue types to workflows. A workflow scheme can be associated with one or more projects, which enables the projects to use the workflow-issue type mappings.

Active workflow schemes (workflow schemes that are used by projects) cannot be edited. Editing an active workflow scheme creates a draft copy of the scheme. The draft workflow scheme can then be edited and published (replacing the active scheme).

See [Configuring workflow schemes](https://confluence.atlassian.com/x/tohKLg) for more information.

## Create draft workflow scheme

`POST /rest/api/3/workflowscheme/{id}/createdraft`

Create a draft workflow scheme from an active workflow scheme, by copying the active workflow scheme. Note that an active workflow scheme can only have one draft workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the active workflow scheme that the draft is created from.

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Delete draft workflow scheme

`DELETE /rest/api/3/workflowscheme/{id}/draft`

Deletes a draft workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the active workflow scheme that the draft was created from.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission..
- **404**: Returned if:

 *  the original active workflow scheme is not found.
 *  the original active workflow scheme does not have a draft.

---

## Get draft workflow scheme

`GET /rest/api/3/workflowscheme/{id}/draft`

Returns the draft workflow scheme for an active workflow scheme. Draft workflow schemes allow changes to be made to the active workflow schemes: When an active workflow scheme is updated, a draft copy is created. The draft is modified, then the changes in the draft are copied back to the active workflow scheme. See [Configuring workflow schemes](https://confluence.atlassian.com/x/tohKLg) for more information.  
Note that:

 *  Only active workflow schemes can have draft workflow schemes.
 *  An active workflow scheme can only have one draft workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the active workflow scheme that the draft was created from.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if:

 *  the original active workflow scheme is not found.
 *  the original active workflow scheme does not have a draft.

---

## Update draft workflow scheme

`PUT /rest/api/3/workflowscheme/{id}/draft`

Updates a draft workflow scheme. If a draft workflow scheme does not exist for the active workflow scheme, then a draft is created. Note that an active workflow scheme can only have one draft workflow scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the active workflow scheme that the draft was created from.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/WorkflowScheme"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if:

 *  the original active workflow scheme is not found.
 *  the original active workflow scheme does not have a draft.

---

## Delete draft default workflow

`DELETE /rest/api/3/workflowscheme/{id}/draft/default`

Resets the default workflow for a workflow scheme's draft. That is, the default workflow is set to Jira's system workflow (the *jira* workflow).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow scheme does not have a draft.

---

## Get draft default workflow

`GET /rest/api/3/workflowscheme/{id}/draft/default`

Returns the default workflow for a workflow scheme's draft. The default workflow is the workflow that is assigned any issue types that have not been mapped to any other workflow. The default workflow has *All Unassigned Issue Types* listed in its issue types for the workflow scheme in Jira.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission..
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow scheme does not have a draft.

---

## Update draft default workflow

`PUT /rest/api/3/workflowscheme/{id}/draft/default`

Sets the default workflow for a workflow scheme's draft.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/DefaultWorkflow"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow scheme does not have a draft.

---

## Delete workflow for issue type in draft workflow scheme

`DELETE /rest/api/3/workflowscheme/{id}/draft/issuetype/{issueType}`

Deletes the issue type-workflow mapping for an issue type in a workflow scheme's draft.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **issueType** (path): The ID of the issue type.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme or issue type is not found.

---

## Get workflow for issue type in draft workflow scheme

`GET /rest/api/3/workflowscheme/{id}/draft/issuetype/{issueType}`

Returns the issue type-workflow mapping for an issue type in a workflow scheme's draft.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **issueType** (path): The ID of the issue type.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme or issue type is not found.

---

## Set workflow for issue type in draft workflow scheme

`PUT /rest/api/3/workflowscheme/{id}/draft/issuetype/{issueType}`

Sets the workflow for an issue type in a workflow scheme's draft.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **issueType** (path): The ID of the issue type.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeWorkflowMapping"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow scheme or issue type is not found.

---

## Publish draft workflow scheme

`POST /rest/api/3/workflowscheme/{id}/draft/publish`

Publishes a draft workflow scheme.

Where the draft workflow includes new workflow statuses for an issue type, mappings are provided to update issues with the original workflow status to the new workflow status.

This operation is [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-3-task-taskId-get) to obtain updates.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **validateOnly** (query): Whether the request only performs a validation.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/PublishDraftWorkflowScheme"
}
```

### Responses

- **204**: Returned if the request is only for validation and is successful.
- **303**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of these are true:

 *  The workflow scheme is not found.
 *  The workflow scheme does not have a draft.
 *  A new status in the draft workflow scheme is not found.

---

## Delete issue types for workflow in draft workflow scheme

`DELETE /rest/api/3/workflowscheme/{id}/draft/workflow`

Deletes the workflow-issue type mapping for a workflow in a workflow scheme's draft.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **workflowName** (query): The name of the workflow.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow scheme does not have a draft.
 *  The workflow is not found.
 *  The workflow is not specified.

---

## Get issue types for workflows in draft workflow scheme

`GET /rest/api/3/workflowscheme/{id}/draft/workflow`

Returns the workflow-issue type mappings for a workflow scheme's draft.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **workflowName** (query): The name of a workflow in the scheme. Limits the results to the workflow-issue type mapping for the specified workflow.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if either the workflow scheme or workflow (if specified) is not found. session.

---

## Set issue types for workflow in workflow scheme

`PUT /rest/api/3/workflowscheme/{id}/draft/workflow`

Sets the issue types for a workflow in a workflow scheme's draft. The workflow can also be set as the default workflow for the draft workflow scheme. Unmapped issues types are mapped to the default workflow.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the workflow scheme that the draft belongs to.
- **workflowName** (query): The name of the workflow.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypesWorkflowMapping"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if any of the following is true:

 *  The workflow scheme is not found.
 *  The workflow scheme does not have a draft.
 *  The workflow is not found.
 *  The workflow is not specified.

---

