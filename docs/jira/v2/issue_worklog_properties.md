# Issue worklog properties

This resource represents [issue worklog](#api-group-Issue-worklogs) properties, which provides for storing custom data against an issue worklog. Use it to get, create, and delete issue worklog properties as well as obtain the keys of all properties on a issue worklog. Issue worklog properties are a type of [entity property](https://developer.atlassian.com/cloud/jira/platform/jira-entity-properties/).

## Get worklog property keys

`GET /rest/api/2/issue/{issueIdOrKey}/worklog/{worklogId}/properties`

Returns the keys of all properties for a worklog.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **worklogId** (path): The ID of the worklog.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the worklog ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the issue or worklog is not found.
 *  the user does not have permission to view the issue or worklog.

---

## Delete worklog property

`DELETE /rest/api/2/issue/{issueIdOrKey}/worklog/{worklogId}/properties/{propertyKey}`

Deletes a worklog property.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **worklogId** (path): The ID of the worklog.
- **propertyKey** (path): The key of the property.

### Responses

- **204**: Returned if the worklog property is removed.
- **400**: Returned if the worklog key or id is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to edit the worklog.
- **404**: Returned if:

 *  the issue, worklog, or property is not found.
 *  the user does not have permission to view the issue or worklog.

---

## Get worklog property

`GET /rest/api/2/issue/{issueIdOrKey}/worklog/{worklogId}/properties/{propertyKey}`

Returns the value of a worklog property.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **worklogId** (path): The ID of the worklog.
- **propertyKey** (path): The key of the property.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the worklog ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the issue, worklog, or property is not found.
 *  the user does not have permission to view the issue or worklog.

---

## Set worklog property

`PUT /rest/api/2/issue/{issueIdOrKey}/worklog/{worklogId}/properties/{propertyKey}`

Sets the value of a worklog property. Use this operation to store custom data against the worklog.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Edit all worklogs*[ project permission](https://confluence.atlassian.com/x/yodKLg) to update any worklog or *Edit own worklogs* to update worklogs created by the user.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **worklogId** (path): The ID of the worklog.
- **propertyKey** (path): The key of the issue property. The maximum length is 255 characters.

### Request Body

**application/json**

```json

```

### Responses

- **200**: Returned if the worklog property is updated.
- **201**: Returned if the worklog property is created.
- **400**: Returned if the worklog ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to edit the worklog.
- **404**: Returned if:

 *  the issue or worklog is not found.
 *  the user does not have permission to view the issue or worklog.

---

