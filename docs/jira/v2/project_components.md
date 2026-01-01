# Project components

This resource represents project components. Use it to get, create, update, and delete project components. Also get components for project and get a count of issues by component.

## Find components for projects

`GET /rest/api/2/component`

Returns a [paginated](#pagination) list of all components in a project, including global (Compass) components when applicable.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectIdsOrKeys** (query): The project IDs and/or project keys (case sensitive).
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `description` Sorts by the component description.
 *  `name` Sorts by component name.
- **query** (query): Filter the results using a literal string. Components with a matching `name` or `description` are returned (case insensitive).

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

## Create component

`POST /rest/api/2/component`

Creates a component. Use components to provide containers for issues within a project. Use components to provide containers for issues within a project.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project in which the component is created or *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ProjectComponent" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if:

 *  the user is not found.
 *  `name` is not provided.
 *  `name` is over 255 characters in length.
 *  `projectId` is not provided.
 *  `assigneeType` is an invalid value.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to manage the project containing the component or does not have permission to administer Jira.
- **404**: Returned if the project is not found or the user does not have permission to browse the project containing the component.

---

## Delete component

`DELETE /rest/api/2/component/{id}`

Deletes a component.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the component or *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the component.
- **moveIssuesTo** (query): The ID of the component to replace the deleted component. If this value is null no replacement is made.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to manage the project containing the component or does not have permission to administer Jira.
- **404**: Returned if:

 *  the component is not found.
 *  the replacement component is not found.
 *  the user does not have permission to browse the project containing the component.

---

## Get component

`GET /rest/api/2/component/{id}`

Returns a component.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for project containing the component.

### Parameters

- **id** (path): The ID of the component.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the component is not found or the user does not have permission to browse the project containing the component.

---

## Update component

`PUT /rest/api/2/component/{id}`

Updates a component. Any fields included in the request are overwritten. If `leadAccountId` is an empty string ("") the component lead is removed.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the component or *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the component.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ProjectComponent" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:

 *  the user is not found.
 *  `assigneeType` is an invalid value.
 *  `name` is over 255 characters in length.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to manage the project containing the component or does not have permission to administer Jira.
- **404**: Returned if the component is not found or the user does not have permission to browse the project containing the component.

---

## Get component issues count

`GET /rest/api/2/component/{id}/relatedIssueCounts`

Returns the counts of issues assigned to the component.

This operation can be accessed anonymously.

**Deprecation notice:** The required OAuth 2.0 scopes will be updated on June 15, 2024.

 *  **Classic**: `read:jira-work`
 *  **Granular**: `read:field:jira`, `read:project.component:jira`

**[Permissions](#permissions) required:** None.

### Parameters

- **id** (path): The ID of the component.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the component is not found.

---

## Get project components paginated

`GET /rest/api/2/project/{projectIdOrKey}/component`

Returns a [paginated](#pagination) list of all components in a project. See the [Get project components](#api-rest-api-2-project-projectIdOrKey-components-get) resource if you want to get a full list of versions without pagination.

If your project uses Compass components, this API will return a list of Compass components that are linked to issues in that project.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `description` Sorts by the component description.
 *  `issueCount` Sorts by the count of issues associated with the component.
 *  `lead` Sorts by the user key of the component's project lead.
 *  `name` Sorts by component name.
- **componentSource** (query): The source of the components to return. Can be `jira` (default), `compass` or `auto`. When `auto` is specified, the API will return connected Compass components if the project is opted into Compass, otherwise it will return Jira components. Defaults to `jira`.
- **query** (query): Filter the results using a literal string. Components with a matching `name` or `description` are returned (case insensitive).

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

## Get project components

`GET /rest/api/2/project/{projectIdOrKey}/components`

Returns all components in a project. See the [Get project components paginated](#api-rest-api-2-project-projectIdOrKey-component-get) resource if you want to get a full list of components with pagination.

If your project uses Compass components, this API will return a paginated list of Compass components that are linked to issues in that project.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **componentSource** (query): The source of the components to return. Can be `jira` (default), `compass` or `auto`. When `auto` is specified, the API will return connected Compass components if the project is opted into Compass, otherwise it will return Jira components. Defaults to `jira`.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

