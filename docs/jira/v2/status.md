# Status

This resource represents statuses. Use it to search, get, create, delete, and change statuses.

## Bulk delete Statuses

`DELETE /rest/api/2/statuses`

Deletes statuses by ID.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Administer Jira* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters

- **id** (query): The list of status IDs. To include multiple IDs, provide an ampersand-separated list. For example, id=10000&id=10001.

Min items `1`, Max items `50`

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.

---

## Bulk get statuses

`GET /rest/api/2/statuses`

Returns a list of the statuses specified by one or more status IDs.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Administer Jira* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters

- **id** (query): The list of status IDs. To include multiple IDs, provide an ampersand-separated list. For example, id=10000&id=10001.

Min items `1`, Max items `50`

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.

---

## Bulk create statuses

`POST /rest/api/2/statuses`

Creates statuses for a global or project scope.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Administer Jira* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/StatusCreateRequest" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **409**: Returned if another workflow configuration update task is ongoing.

---

## Bulk update statuses

`PUT /rest/api/2/statuses`

Updates statuses by ID.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Administer Jira* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/StatusUpdateRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **409**: Returned if another workflow configuration update task is ongoing.

---

## Bulk get statuses by name

`GET /rest/api/2/statuses/byNames`

Returns a list of the statuses specified by one or more status names.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Administer Jira* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Browse projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters

- **name** (query): The list of status names. To include multiple names, provide an ampersand-separated list. For example, name=nameXX&name=nameYY.

Min items `1`, Max items `50`
- **projectId** (query): The project the status is part of or null for global statuses.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.

---

## Search statuses paginated

`GET /rest/api/2/statuses/search`

Returns a [paginated](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/#pagination) list of statuses that match a search on name or project.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)
 *  *Administer Jira* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters

- **projectId** (query): The project the status is part of or null for global statuses.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **searchString** (query): Term to match status names against or null to search for all statuses in the search scope.
- **statusCategory** (query): Category of the status to filter by. The supported values are: `TODO`, `IN_PROGRESS`, and `DONE`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.

---

## Get issue type usages by status and project

`GET /rest/api/2/statuses/{statusId}/project/{projectId}/issueTypeUsages`

Returns a page of issue types in a project using a given status.

### Parameters

- **statusId** (path): The statusId to fetch issue type usages for
- **projectId** (path): The projectId to fetch issue type usages for
- **nextPageToken** (query): The cursor for pagination
- **maxResults** (query): The maximum number of results to return. Must be an integer between 1 and 200.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **404**: Returned if the status with the given ID does not exist.

---

## Get project usages by status

`GET /rest/api/2/statuses/{statusId}/projectUsages`

Returns a page of projects using a given status.

### Parameters

- **statusId** (path): The statusId to fetch project usages for
- **nextPageToken** (query): The cursor for pagination
- **maxResults** (query): The maximum number of results to return. Must be an integer between 1 and 200.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **404**: Returned if the status with the given ID does not exist.

---

## Get workflow usages by status

`GET /rest/api/2/statuses/{statusId}/workflowUsages`

Returns a page of workflows using a given status.

### Parameters

- **statusId** (path): The statusId to fetch workflow usages for
- **nextPageToken** (query): The cursor for pagination
- **maxResults** (query): The maximum number of results to return. Must be an integer between 1 and 200.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing, or the caller doesn't have permissions to perform the operation.
- **404**: Returned if the status with the given ID does not exist.

---

