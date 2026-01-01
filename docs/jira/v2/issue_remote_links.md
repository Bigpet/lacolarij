# Issue remote links

This resource represents remote issue links, a way of linking Jira to information in other systems. Use it to get, create, update, and delete remote issue links either by ID or global ID. The global ID provides a way of accessing remote issue links using information about the item's remote system host and remote system identifier.

## Delete remote issue link by global ID

`DELETE /rest/api/2/issue/{issueIdOrKey}/remotelink`

Deletes the remote issue link from the issue using the link's global ID. Where the global ID includes reserved URL characters these must be escaped in the request. For example, pass `system=http://www.mycompany.com/support&id=1` as `system%3Dhttp%3A%2F%2Fwww.mycompany.com%2Fsupport%26id%3D1`.

This operation requires [issue linking to be active](https://confluence.atlassian.com/x/yoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Link issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is implemented, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **globalId** (query): The global ID of a remote issue link.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if a global ID isn't provided.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to link issues.
- **404**: Returned if the issue or remote issue link is not found or the user does not have permission to view the issue.

---

## Get remote issue links

`GET /rest/api/2/issue/{issueIdOrKey}/remotelink`

Returns the remote issue links for an issue. When a remote issue link global ID is provided the record with that global ID is returned, otherwise all remote issue links are returned. Where a global ID includes reserved URL characters these must be escaped in the request. For example, pass `system=http://www.mycompany.com/support&id=1` as `system%3Dhttp%3A%2F%2Fwww.mycompany.com%2Fsupport%26id%3D1`.

This operation requires [issue linking to be active](https://confluence.atlassian.com/x/yoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **globalId** (query): The global ID of the remote issue link.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if issue linking is disabled.
- **404**: Returned if the issue or remote issue link is not found or the user does not have permission to view the issue.
- **413**: Returned if the per-issue limit for remote links has been breached.

---

## Create or update remote issue link

`POST /rest/api/2/issue/{issueIdOrKey}/remotelink`

Creates or updates a remote issue link for an issue.

If a `globalId` is provided and a remote issue link with that global ID is found it is updated. Any fields without values in the request are set to null. Otherwise, the remote issue link is created.

This operation requires [issue linking to be active](https://confluence.atlassian.com/x/yoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Link issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/RemoteIssueLinkRequest" }
```

### Responses

- **200**: Returned if the remote issue link is updated.
- **201**: Returned if the remote issue link is created.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to link issues.
- **404**: Returned if the issue is not found or the user does not have permission to view the issue.

---

## Delete remote issue link by ID

`DELETE /rest/api/2/issue/{issueIdOrKey}/remotelink/{linkId}`

Deletes a remote issue link from an issue.

This operation requires [issue linking to be active](https://confluence.atlassian.com/x/yoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects*, *Edit issues*, and *Link issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **linkId** (path): The ID of a remote issue link.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the link ID is invalid or the remote issue link does not belong to the issue.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to link issues.
- **404**: Returned if the issue or remote issue link is not found or the user does not have permission to view the issue.

---

## Get remote issue link by ID

`GET /rest/api/2/issue/{issueIdOrKey}/remotelink/{linkId}`

Returns a remote issue link for an issue.

This operation requires [issue linking to be active](https://confluence.atlassian.com/x/yoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **linkId** (path): The ID of the remote issue link.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the link ID is invalid or the remote issue link does not belong to the issue.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if issue linking is disabled.
- **404**: Returned if the issue or remote issue link is not found or the user does not have permission to view the issue.

---

## Update remote issue link by ID

`PUT /rest/api/2/issue/{issueIdOrKey}/remotelink/{linkId}`

Updates a remote issue link for an issue.

Note: Fields without values in the request are set to null.

This operation requires [issue linking to be active](https://confluence.atlassian.com/x/yoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Link issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **linkId** (path): The ID of the remote issue link.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/RemoteIssueLinkRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if:

 *  the link ID is invalid.
 *  the remote issue link does not belong to the issue.
 *  the request body is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to link issues.
- **404**: Returned if the issue or remote issue link is not found or the user does not have permission to view the issue.

---

