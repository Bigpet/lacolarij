# Issue watchers

This resource represents users watching an issue. Use it to get details of users watching an issue as well as start and stop a user watching an issue.

## Get is watching issue bulk

`POST /rest/api/2/issue/watching`

Returns, for the user, details of the watched status of issues from a list. If an issue ID is invalid, the returned watched status is `false`.

This operation requires the **Allow users to watch issues** option to be *ON*. This option is set in General configuration for Jira. See [Configuring Jira application options](https://confluence.atlassian.com/x/uYXKM) for details.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueList" }
```

### Responses

- **200**: Returned if the request is successful
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Delete watcher

`DELETE /rest/api/2/issue/{issueIdOrKey}/watchers`

Deletes a user as a watcher of an issue.

This operation requires the **Allow users to watch issues** option to be *ON*. This option is set in General configuration for Jira. See [Configuring Jira application options](https://confluence.atlassian.com/x/uYXKM) for details.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  To remove users other than themselves from the watchlist, *Manage watcher list* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **username** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.
- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*. Required.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if `accountId` is not supplied.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the permission to manage the watcher list.
- **404**: Returned if the issue or the user is not found or the user does not have permission to view the issue.

---

## Get issue watchers

`GET /rest/api/2/issue/{issueIdOrKey}/watchers`

Returns the watchers for an issue.

This operation requires the **Allow users to watch issues** option to be *ON*. This option is set in General configuration for Jira. See [Configuring Jira application options](https://confluence.atlassian.com/x/uYXKM) for details.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is ini
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  To see details of users on the watchlist other than themselves, *View voters and watchers* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.

### Responses

- **200**: Returned if the request is successful
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue is not found or the user does not have permission to view it.

---

## Add watcher

`POST /rest/api/2/issue/{issueIdOrKey}/watchers`

Adds a user as a watcher of an issue by passing the account ID of the user. For example, `"5b10ac8d82e05b22cc7d4ef5"`. If no user is specified the calling user is added.

This operation requires the **Allow users to watch issues** option to be *ON*. This option is set in General configuration for Jira. See [Configuring Jira application options](https://confluence.atlassian.com/x/uYXKM) for details.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  To add users other than themselves to the watchlist, *Manage watcher list* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.

### Request Body

**application/json**

```json
{
  "type": "string"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the permission to manage the watcher list.
- **404**: Returned if the issue or the user is not found or the user does not have permission to view the issue.

---

