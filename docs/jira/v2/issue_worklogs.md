# Issue worklogs

This resource represents issue worklogs. Use it to:

 *  get, create, update, and delete worklogs.
 *  obtain lists of updated or deleted worklogs.

## Bulk delete worklogs

`DELETE /rest/api/2/issue/{issueIdOrKey}/worklog`

Deletes a list of worklogs from an issue. This is an experimental API with limitations:

 *  You can't delete more than 5000 worklogs at once.
 *  No notifications will be sent for deleted worklogs.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Delete all worklogs*[ project permission](https://confluence.atlassian.com/x/yodKLg) to delete any worklog.
 *  If any worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **adjustEstimate** (query): Defines how to update the issue's time estimate, the options are:

 *  `leave` Leaves the estimate unchanged.
 *  `auto` Reduces the estimate by the aggregate value of `timeSpent` across all worklogs being deleted.
- **overrideEditableFlag** (query): Whether the work log entries should be removed to the issue even if the issue is not editable, because jira.issue.editable set to false or missing. For example, the issue is closed. Connect and Forge app users with admin permission can use this flag.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorklogIdsRequestBean" }
```

### Responses

- **200**: Returned if the bulk deletion request was partially successful, with a message indicating partial success.
- **204**: Returned if the request is successful.
- **400**: Returned if:

 *  `request` is not provided or is invalid
 *  the user does not have permission to delete the worklogs
 *  the number of worklogs being deleted exceeds the limit
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if:

 *  the issue is not found or user does not have permission to view the issue
 *  at least one of the worklogs is not associated with the provided issue
 *  time tracking is disabled

---

## Get issue worklogs

`GET /rest/api/2/issue/{issueIdOrKey}/worklog`

Returns worklogs for an issue (ordered by created time), starting from the oldest worklog or from the worklog started on or after a date and time.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Workloads are only returned where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **startedAfter** (query): The worklog start date and time, as a UNIX timestamp in milliseconds, after which worklogs are returned.
- **startedBefore** (query): The worklog start date and time, as a UNIX timestamp in milliseconds, before which worklogs are returned.
- **expand** (query): Use [expand](#expansion) to include additional information about worklogs in the response. This parameter accepts`properties`, which returns worklog properties.

### Responses

- **200**: Returned if the request is successful
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the issue is not found or the user does not have permission to view the issue.
 *  `startAt` or `maxResults` has non-numeric values.
 *  time tracking is disabled.

---

## Add worklog

`POST /rest/api/2/issue/{issueIdOrKey}/worklog`

Adds a worklog to an issue.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Work on issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key the issue.
- **notifyUsers** (query): Whether users watching the issue are notified by email.
- **adjustEstimate** (query): Defines how to update the issue's time estimate, the options are:

 *  `new` Sets the estimate to a specific value, defined in `newEstimate`.
 *  `leave` Leaves the estimate unchanged.
 *  `manual` Reduces the estimate by amount specified in `reduceBy`.
 *  `auto` Reduces the estimate by the value of `timeSpent` in the worklog.
- **newEstimate** (query): The value to set as the issue's remaining time estimate, as days (\#d), hours (\#h), or minutes (\#m or \#). For example, *2d*. Required when `adjustEstimate` is `new`.
- **reduceBy** (query): The amount to reduce the issue's remaining estimate by, as days (\#d), hours (\#h), or minutes (\#m). For example, *2d*. Required when `adjustEstimate` is `manual`.
- **expand** (query): Use [expand](#expansion) to include additional information about work logs in the response. This parameter accepts `properties`, which returns worklog properties.
- **overrideEditableFlag** (query): Whether the worklog entry should be added to the issue even if the issue is not editable, because jira.issue.editable set to false or missing. For example, the issue is closed. Connect and Forge app users with *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) can use this flag.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/Worklog" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if:

 *  `adjustEstimate` is set to `new` but `newEstimate` is not provided or is invalid.
 *  `adjustEstimate` is set to `manual` but `reduceBy` is not provided or is invalid.
 *  the user does not have permission to add the worklog.
 *  the request JSON is malformed.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the issue is not found or the user does not have permission to view it.
- **413**: Returned if the per-issue limit has been breached for one of the following fields:

 *  worklogs
 *  attachments

---

## Bulk move worklogs

`POST /rest/api/2/issue/{issueIdOrKey}/worklog/move`

Moves a list of worklogs from one issue to another. This is an experimental API with several limitations:

 *  You can't move more than 5000 worklogs at once.
 *  You can't move worklogs containing an attachment.
 *  You can't move worklogs restricted by project roles.
 *  No notifications will be sent for moved worklogs.
 *  No webhooks or events will be sent for moved worklogs.
 *  No issue history will be recorded for moved worklogs.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the projects containing the source and destination issues.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Delete all worklogs*[ and *Edit all worklogs*](https://confluence.atlassian.com/x/yodKLg)[project permission](https://confluence.atlassian.com/x/yodKLg)
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): 
- **adjustEstimate** (query): Defines how to update the issues' time estimate, the options are:

 *  `leave` Leaves the estimate unchanged.
 *  `auto` Reduces the estimate by the aggregate value of `timeSpent` across all worklogs being moved in the source issue, and increases it in the destination issue.
- **overrideEditableFlag** (query): Whether the work log entry should be moved to and from the issues even if the issues are not editable, because jira.issue.editable set to false or missing. For example, the issue is closed. Connect and Forge app users with admin permission can use this flag.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorklogsMoveRequestBean" }
```

### Responses

- **200**: Returned if the request is partially successful.
- **204**: Returned if the request is successful.
- **400**: Returned if:

 *  `request` is not provided or is invalid
 *  the user does not have permission to move the worklogs
 *  the number of worklogs being moved exceeds the limit
 *  the total size of worklogs being moved is too large
 *  any worklog contains attachments
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if:

 *  the source or destination issue is not found or the user does not have permission to view the issues
 *  at least one of the worklogs is not associated with the provided issue
 *  time tracking is disabled

---

## Delete worklog

`DELETE /rest/api/2/issue/{issueIdOrKey}/worklog/{id}`

Deletes a worklog from an issue.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Delete all worklogs*[ project permission](https://confluence.atlassian.com/x/yodKLg) to delete any worklog or *Delete own worklogs* to delete worklogs created by the user,
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **id** (path): The ID of the worklog.
- **notifyUsers** (query): Whether users watching the issue are notified by email.
- **adjustEstimate** (query): Defines how to update the issue's time estimate, the options are:

 *  `new` Sets the estimate to a specific value, defined in `newEstimate`.
 *  `leave` Leaves the estimate unchanged.
 *  `manual` Increases the estimate by amount specified in `increaseBy`.
 *  `auto` Reduces the estimate by the value of `timeSpent` in the worklog.
- **newEstimate** (query): The value to set as the issue's remaining time estimate, as days (\#d), hours (\#h), or minutes (\#m or \#). For example, *2d*. Required when `adjustEstimate` is `new`.
- **increaseBy** (query): The amount to increase the issue's remaining estimate by, as days (\#d), hours (\#h), or minutes (\#m or \#). For example, *2d*. Required when `adjustEstimate` is `manual`.
- **overrideEditableFlag** (query): Whether the work log entry should be added to the issue even if the issue is not editable, because jira.issue.editable set to false or missing. For example, the issue is closed. Connect and Forge app users with admin permission can use this flag.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if:

 *  `adjustEstimate` is set to `new` but `newEstimate` is not provided or is invalid.
 *  `adjustEstimate` is set to `manual` but `reduceBy` is not provided or is invalid.
 *  the user does not have permission to delete the worklog.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if:

 *  the issue is not found or user does not have permission to view the issue.
 *  the worklog is not found or the user does not have permission to view it.
 *  time tracking is disabled.

---

## Get worklog

`GET /rest/api/2/issue/{issueIdOrKey}/worklog/{id}`

Returns a worklog.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **id** (path): The ID of the worklog.
- **expand** (query): Use [expand](#expansion) to include additional information about work logs in the response. This parameter accepts

`properties`, which returns worklog properties.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if:

 *  the issue is not found or the user does not have permission to view it.
 *  the worklog is not found or the user does not have permission to view it.
 *  time tracking is disabled.

.

---

## Update worklog

`PUT /rest/api/2/issue/{issueIdOrKey}/worklog/{id}`

Updates a worklog.

Time tracking must be enabled in Jira, otherwise this operation returns an error. For more information, see [Configuring time tracking](https://confluence.atlassian.com/x/qoXKM).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Edit all worklogs*[ project permission](https://confluence.atlassian.com/x/yodKLg) to update any worklog or *Edit own worklogs* to update worklogs created by the user.
 *  If the worklog has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key the issue.
- **id** (path): The ID of the worklog.
- **notifyUsers** (query): Whether users watching the issue are notified by email.
- **adjustEstimate** (query): Defines how to update the issue's time estimate, the options are:

 *  `new` Sets the estimate to a specific value, defined in `newEstimate`.
 *  `leave` Leaves the estimate unchanged.
 *  `auto` Updates the estimate by the difference between the original and updated value of `timeSpent` or `timeSpentSeconds`.
- **newEstimate** (query): The value to set as the issue's remaining time estimate, as days (\#d), hours (\#h), or minutes (\#m or \#). For example, *2d*. Required when `adjustEstimate` is `new`.
- **expand** (query): Use [expand](#expansion) to include additional information about worklogs in the response. This parameter accepts `properties`, which returns worklog properties.
- **overrideEditableFlag** (query): Whether the worklog should be added to the issue even if the issue is not editable. For example, because the issue is closed. Connect and Forge app users with *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) can use this flag.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/Worklog" }
```

### Responses

- **200**: Returned if the request is successful
- **400**: Returned if:

 *  `adjustEstimate` is set to `new` but `newEstimate` is not provided or is invalid.
 *  the user does not have permission to update the worklog.
 *  the request JSON is malformed.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if:

 *  the issue is not found or user does not have permission to view the issue.
 *  the worklog is not found or the user does not have permission to view it.
 *  time tracking is disabled.

---

## Get IDs of deleted worklogs

`GET /rest/api/2/worklog/deleted`

Returns a list of IDs and delete timestamps for worklogs deleted after a date and time.

This resource is paginated, with a limit of 1000 worklogs per page. Each page lists worklogs from oldest to youngest. If the number of items in the date range exceeds 1000, `until` indicates the timestamp of the youngest item on the page. Also, `nextPage` provides the URL for the next page of worklogs. The `lastPage` parameter is set to true on the last page of worklogs.

This resource does not return worklogs deleted during the minute preceding the request.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **since** (query): The date and time, as a UNIX timestamp in milliseconds, after which deleted worklogs are returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get worklogs

`POST /rest/api/2/worklog/list`

Returns worklog details for a list of worklog IDs.

The returned list of worklogs is limited to 1000 items.

**[Permissions](#permissions) required:** Permission to access Jira, however, worklogs are only returned where either of the following is true:

 *  the worklog is set as *Viewable by All Users*.
 *  the user is a member of a project role or group with permission to view the worklog.

### Parameters

- **expand** (query): Use [expand](#expansion) to include additional information about worklogs in the response. This parameter accepts `properties` that returns the properties of each worklog.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorklogIdsRequestBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request contains more than 1000 worklog IDs or is empty.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get IDs of updated worklogs

`GET /rest/api/2/worklog/updated`

Returns a list of IDs and update timestamps for worklogs updated after a date and time.

This resource is paginated, with a limit of 1000 worklogs per page. Each page lists worklogs from oldest to youngest. If the number of items in the date range exceeds 1000, `until` indicates the timestamp of the youngest item on the page. Also, `nextPage` provides the URL for the next page of worklogs. The `lastPage` parameter is set to true on the last page of worklogs.

This resource does not return worklogs updated during the minute preceding the request.

**[Permissions](#permissions) required:** Permission to access Jira, however, worklogs are only returned where either of the following is true:

 *  the worklog is set as *Viewable by All Users*.
 *  the user is a member of a project role or group with permission to view the worklog.

### Parameters

- **since** (query): The date and time, as a UNIX timestamp in milliseconds, after which updated worklogs are returned.
- **expand** (query): Use [expand](#expansion) to include additional information about worklogs in the response. This parameter accepts `properties` that returns the properties of each worklog.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

