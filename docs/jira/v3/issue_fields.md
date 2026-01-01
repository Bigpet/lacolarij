# Issue fields

This resource represents issue fields, both system and custom fields. Use it to get fields, field configurations, and create custom fields.

## Get fields

`GET /rest/api/3/field`

Returns system and custom issue fields according to the following rules:

 *  Fields that cannot be added to the issue navigator are always returned.
 *  Fields that cannot be placed on an issue screen are always returned.
 *  Fields that depend on global Jira settings are only returned if the setting is enabled. That is, timetracking fields, subtasks, votes, and watches.
 *  For all other fields, this operation only returns the fields that the user has permission to view (that is, the field is used in at least one project that the user has *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for.)

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Create custom field

`POST /rest/api/3/field`

Creates a custom field.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/CustomFieldDefinitionJsonBean"
}
```

### Responses

- **201**: Returned if the custom field is created.
- **400**: Returned if:

 *  the user does not have permission to create custom fields.
 *  any of the request object properties have invalid or missing values.

---

## Get fields paginated

`GET /rest/api/3/field/search`

Returns a [paginated](#pagination) list of fields for Classic Jira projects. The list can include:

 *  all fields
 *  specific fields, by defining `id`
 *  fields that contain a string in the field name or description, by defining `query`
 *  specific fields that contain a string in the field name or description, by defining `id` and `query`

Use `type` must be set to `custom` to show custom fields only.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **type** (query): The type of fields to search.
- **id** (query): The IDs of the custom fields to return or, where `query` is specified, filter.
- **query** (query): String used to perform a case-insensitive partial match with field names or descriptions.
- **orderBy** (query): [Order](#ordering) the results by:

 *  `contextsCount` sorts by the number of contexts related to a field
 *  `lastUsed` sorts by the date when the value of the field last changed
 *  `name` sorts by the field name
 *  `screensCount` sorts by the number of screens related to a field
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `key` returns the key for each field
 *  `stableId` returns the stableId for each field
 *  `lastUsed` returns the date when the value of the field last changed
 *  `screensCount` returns the number of screens related to a field
 *  `contextsCount` returns the number of contexts related to a field
 *  `isLocked` returns information about whether the field is locked
 *  `searcherKey` returns the searcher key for each custom field
- **projectIds** (query): The IDs of the projects to filter the fields by. Fields belonging to project Ids that the user does not have access to will not be returned

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Get fields in trash paginated

`GET /rest/api/3/field/search/trashed`

Returns a [paginated](#pagination) list of fields in the trash. The list may be restricted to fields whose field name or description partially match a string.

Only custom fields can be queried, `type` must be set to `custom`.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): 
- **query** (query): String used to perform a case-insensitive partial match with field names or descriptions.
- **expand** (query): 
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `name` sorts by the field name
 *  `trashDate` sorts by the date the field was moved to the trash
 *  `plannedDeletionDate` sorts by the planned deletion date

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Update custom field

`PUT /rest/api/3/field/{fieldId}`

Updates a custom field.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the custom field.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/UpdateCustomFieldDetails"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the custom field is not found.

---

## Get contexts for a field

`GET /rest/api/3/field/{fieldId}/contexts`

Returns a [paginated](#pagination) list of the contexts a field is used in. Deprecated, use [ Get custom field contexts](#api-rest-api-3-field-fieldId-context-get).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the field to return contexts for.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Delete custom field

`DELETE /rest/api/3/field/{id}`

Deletes a custom field. The custom field is deleted whether it is in the trash or not. See [Edit or delete a custom field](https://confluence.atlassian.com/x/Z44fOw) for more information on trashing and deleting custom fields.

This operation is [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-3-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of a custom field.

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if any of these are true:

 *  The custom field is locked.
 *  The custom field is used in a issue security scheme or a permission scheme.
 *  The custom field ID format is incorrect.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the custom field is not found.
- **409**: Returned if a task to delete the custom field is running.

---

## Restore custom field from trash

`POST /rest/api/3/field/{id}/restore`

Restores a custom field from trash. See [Edit or delete a custom field](https://confluence.atlassian.com/x/Z44fOw) for more information on trashing and deleting custom fields.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of a custom field.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the custom field is not found.

---

## Move custom field to trash

`POST /rest/api/3/field/{id}/trash`

Moves a custom field to trash. See [Edit or delete a custom field](https://confluence.atlassian.com/x/Z44fOw) for more information on trashing and deleting custom fields.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of a custom field.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the custom field is not found.

---

## Get fields for projects

`GET /rest/api/3/projects/fields`

Returns a [paginated](#pagination) list of fields for the requested projects and work types.

Only fields that are available for the specified combination of projects and work types are returned. This endpoint allows filtering to specific fields if field IDs are provided.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **projectId** (query): The IDs of projects to return fields for.
- **workTypeId** (query): The IDs of work types (issue types) to return fields for.
- **fieldId** (query): The IDs of fields to return. If not provided, all fields are returned.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request parameters are invalid.
- **401**: Returned if authentication is missing.
- **403**: Returned if the user does not have permission to view the projects or work types.
- **404**: Returned if the endpoint is not enabled via feature flag.

---

