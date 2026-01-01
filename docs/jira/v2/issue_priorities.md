# Issue priorities

This resource represents issue priorities. Use it to get, create and update issue priorities and details for individual issue priorities.

## Get priorities

`GET /rest/api/2/priority`

Returns the list of all issue priorities.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.

---

## Create priority

`POST /rest/api/2/priority`

Creates an issue priority.

Deprecation applies to iconUrl param in request body which will be sunset on 16th Mar 2025. For more details refer to [changelog](https://developer.atlassian.com/changelog/#CHANGE-1525).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreatePriorityDetails" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Set default priority

`PUT /rest/api/2/priority/default`

Sets default issue priority.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SetDefaultPriorityRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue priority isn't found.

---

## Move priorities

`PUT /rest/api/2/priority/move`

Changes the order of issue priorities.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ReorderIssuePriorities" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue priority isn't found.

---

## Search priorities

`GET /rest/api/2/priority/search`

Returns a [paginated](#pagination) list of priorities. The list can contain all priorities or a subset determined by any combination of these criteria:

 *  a list of priority IDs. Any invalid priority IDs are ignored.
 *  a list of project IDs. Only priorities that are available in these projects will be returned. Any invalid project IDs are ignored.
 *  whether the field configuration is a default. This returns priorities from company-managed (classic) projects only, as there is no concept of default priorities in team-managed projects.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of priority IDs. To include multiple IDs, provide an ampersand-separated list. For example, `id=2&id=3`.
- **projectId** (query): The list of projects IDs. To include multiple IDs, provide an ampersand-separated list. For example, `projectId=10010&projectId=10111`.
- **priorityName** (query): The name of priority to search for.
- **onlyDefault** (query): Whether only the default priority is returned.
- **expand** (query): Use `schemes` to return the associated priority schemes for each priority. Limited to returning first 15 priority schemes per priority.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Delete priority

`DELETE /rest/api/2/priority/{id}`

Deletes an issue priority.

This operation is [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-2-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the issue priority.

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue priority isn't found.
- **409**: Returned if a task to delete the issue priority is already running.

---

## Get priority

`GET /rest/api/2/priority/{id}`

Returns an issue priority.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **id** (path): The ID of the issue priority.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the issue priority isn't found.

---

## Update priority

`PUT /rest/api/2/priority/{id}`

Updates an issue priority.

At least one request body parameter must be defined.

Deprecation applies to iconUrl param in request body which will be sunset on 16th Mar 2025. For more details refer to [changelog](https://developer.atlassian.com/changelog/#CHANGE-1525).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the issue priority.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdatePriorityDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue priority isn't found.

---

