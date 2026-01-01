# Issue resolutions

This resource represents issue resolution values. Use it to obtain a list of all issue resolution values and the details of individual resolution values.

## Get resolutions

`GET /rest/api/2/resolution`

Returns a list of all issue resolution values.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Create resolution

`POST /rest/api/2/resolution`

Creates an issue resolution.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreateResolutionDetails" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Set default resolution

`PUT /rest/api/2/resolution/default`

Sets default issue resolution.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SetDefaultResolutionRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue resolution isn't found.

---

## Move resolutions

`PUT /rest/api/2/resolution/move`

Changes the order of issue resolutions.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ReorderIssueResolutionsRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue resolution isn't found.

---

## Search resolutions

`GET /rest/api/2/resolution/search`

Returns a [paginated](#pagination) list of resolutions. The list can contain all resolutions or a subset determined by any combination of these criteria:

 *  a list of resolutions IDs.
 *  whether the field configuration is a default. This returns resolutions from company-managed (classic) projects only, as there is no concept of default resolutions in team-managed projects.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of resolutions IDs to be filtered out
- **onlyDefault** (query): When set to true, return default only, when IDs provided, if none of them is default, return empty page. Default value is false

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Delete resolution

`DELETE /rest/api/2/resolution/{id}`

Deletes an issue resolution.

This operation is [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-2-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the issue resolution.
- **replaceWith** (query): The ID of the issue resolution that will replace the currently selected resolution.

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue resolution isn't found.
- **409**: Returned if a task to delete the issue resolution is already running.

---

## Get resolution

`GET /rest/api/2/resolution/{id}`

Returns an issue resolution value.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **id** (path): The ID of the issue resolution value.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue resolution value is not found.

---

## Update resolution

`PUT /rest/api/2/resolution/{id}`

Updates an issue resolution.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the issue resolution.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateResolutionDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue resolution isn't found.

---

