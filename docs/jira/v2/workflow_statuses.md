# Workflow statuses

This resource represents issue workflow statuses. Use it to obtain a list of all statuses associated with workflows and the details of a status.

## Get all statuses

`GET /rest/api/2/status`

Returns a list of all statuses associated with active workflows.

This operation can be accessed anonymously.

[Permissions](#permissions) required: *Browse projects* [project permission](https://support.atlassian.com/jira-cloud-administration/docs/manage-project-permissions/) for the project.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get status

`GET /rest/api/2/status/{idOrName}`

Returns a status. The status must be associated with an active workflow to be returned.

If a name is used on more than one status, only the status found first is returned. Therefore, identifying the status by its ID may be preferable.

This operation can be accessed anonymously.

[Permissions](#permissions) required: *Browse projects* [project permission](https://support.atlassian.com/jira-cloud-administration/docs/manage-project-permissions/) for the project.

### Parameters

- **idOrName** (path): The ID or name of the status.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the status is not found.
 *  the status is not associated with a workflow.
 *  the user does not have the required permissions.

---

