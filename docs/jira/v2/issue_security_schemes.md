# Issue security schemes

This resource represents issue security schemes. Use it to get an issue security scheme or a list of issue security schemes.

Issue security schemes control which users or groups of users can view an issue. When an issue security scheme is associated with a project, its security levels can be applied to issues in that project. Sub-tasks also inherit the security level of their parent issue.

## Get issue security schemes

`GET /rest/api/2/issuesecurityschemes`

Returns all [issue security schemes](https://confluence.atlassian.com/x/J4lKLg).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have permission to administer issue security schemes.

---

## Create issue security scheme

`POST /rest/api/2/issuesecurityschemes`

Creates a security scheme with security scheme levels and levels' members. You can create up to 100 security scheme levels and security scheme levels' members per request.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreateIssueSecuritySchemeDetails" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Get issue security levels

`GET /rest/api/2/issuesecurityschemes/level`

Returns a [paginated](#pagination) list of issue security levels.

Only issue security levels in the context of classic projects are returned.

Filtering using IDs is inclusive: if you specify both security scheme IDs and level IDs, the result will include both specified issue security levels and all issue security levels from the specified schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of issue security scheme level IDs. To include multiple issue security levels, separate IDs with an ampersand: `id=10000&id=10001`.
- **schemeId** (query): The list of issue security scheme IDs. To include multiple issue security schemes, separate IDs with an ampersand: `schemeId=10000&schemeId=10001`.
- **onlyDefault** (query): When set to true, returns multiple default levels for each security scheme containing a default. If you provide scheme and level IDs not associated with the default, returns an empty page. The default value is false.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Set default issue security levels

`PUT /rest/api/2/issuesecurityschemes/level/default`

Sets default issue security levels for schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SetDefaultLevelsRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue resolution isn't found.

---

## Get issue security level members

`GET /rest/api/2/issuesecurityschemes/level/member`

Returns a [paginated](#pagination) list of issue security level members.

Only issue security level members in the context of classic projects are returned.

Filtering using parameters is inclusive: if you specify both security scheme IDs and level IDs, the result will include all issue security level members from the specified schemes and levels.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of issue security level member IDs. To include multiple issue security level members separate IDs with an ampersand: `id=10000&id=10001`.
- **schemeId** (query): The list of issue security scheme IDs. To include multiple issue security schemes separate IDs with an ampersand: `schemeId=10000&schemeId=10001`.
- **levelId** (query): The list of issue security level IDs. To include multiple issue security levels separate IDs with an ampersand: `levelId=10000&levelId=10001`.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `all` Returns all expandable information
 *  `field` Returns information about the custom field granted the permission
 *  `group` Returns information about the group that is granted the permission
 *  `projectRole` Returns information about the project role granted the permission
 *  `user` Returns information about the user who is granted the permission

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Get projects using issue security schemes

`GET /rest/api/2/issuesecurityschemes/project`

Returns a [paginated](#pagination) mapping of projects that are using security schemes. You can provide either one or multiple security scheme IDs or project IDs to filter by. If you don't provide any, this will return a list of all mappings. Only issue security schemes in the context of classic projects are supported. **[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **issueSecuritySchemeId** (query): The list of security scheme IDs to be filtered out.
- **projectId** (query): The list of project IDs to be filtered out.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the search criteria is invalid.If you specify the project ID parameter
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Associate security scheme to project

`PUT /rest/api/2/issuesecurityschemes/project`

Associates an issue security scheme with a project and remaps security levels of issues to the new levels, if provided.

This operation is [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-2-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/AssociateSecuritySchemeWithProjectDetails" }
```

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the security scheme isn't found.
- **409**: Returned if a task to remove the issue security level is already running.

---

## Search issue security schemes

`GET /rest/api/2/issuesecurityschemes/search`

Returns a [paginated](#pagination) list of issue security schemes.  
If you specify the project ID parameter, the result will contain issue security schemes and related project IDs you filter by. Use \{@link IssueSecuritySchemeResource\#searchProjectsUsingSecuritySchemes(String, String, Set, Set)\} to obtain all projects related to scheme.

Only issue security schemes in the context of classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of issue security scheme IDs. To include multiple issue security scheme IDs, separate IDs with an ampersand: `id=10000&id=10001`.
- **projectId** (query): The list of project IDs. To include multiple project IDs, separate IDs with an ampersand: `projectId=10000&projectId=10001`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Get issue security scheme

`GET /rest/api/2/issuesecurityschemes/{id}`

Returns an issue security scheme along with its security levels.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).
 *  *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for a project that uses the requested issue security scheme.

### Parameters

- **id** (path): The ID of the issue security scheme. Use the [Get issue security schemes](#api-rest-api-2-issuesecurityschemes-get) operation to get a list of issue security scheme IDs.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the administrator permission and the scheme is not used in any project where the user has administrative permission.

---

## Update issue security scheme

`PUT /rest/api/2/issuesecurityschemes/{id}`

Updates the issue security scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the issue security scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateIssueSecuritySchemeRequestBean" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue security scheme isn't found.

---

## Delete issue security scheme

`DELETE /rest/api/2/issuesecurityschemes/{schemeId}`

Deletes an issue security scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the issue security scheme.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue security scheme isn't found.

---

## Add issue security levels

`PUT /rest/api/2/issuesecurityschemes/{schemeId}/level`

Adds levels and levels' members to the issue security scheme. You can add up to 100 levels per request.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the issue security scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/AddSecuritySchemeLevelsRequestBean" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the security scheme isn't found.

---

## Remove issue security level

`DELETE /rest/api/2/issuesecurityschemes/{schemeId}/level/{levelId}`

Deletes an issue security level.

This operation is [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-2-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the issue security scheme.
- **levelId** (path): The ID of the issue security level to remove.
- **replaceWith** (query): The ID of the issue security level that will replace the currently selected level.

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue security level isn't found.
- **409**: Returned if a task to remove the issue security level is already running.

---

## Update issue security level

`PUT /rest/api/2/issuesecurityschemes/{schemeId}/level/{levelId}`

Updates the issue security level.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the issue security scheme level belongs to.
- **levelId** (path): The ID of the issue security level to update.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateIssueSecurityLevelDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the issue security level isn't found.

---

## Add issue security level members

`PUT /rest/api/2/issuesecurityschemes/{schemeId}/level/{levelId}/member`

Adds members to the issue security level. You can add up to 100 members per request.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the issue security scheme.
- **levelId** (path): The ID of the issue security level.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SecuritySchemeMembersRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the security scheme isn't found.

---

## Remove member from issue security level

`DELETE /rest/api/2/issuesecurityschemes/{schemeId}/level/{levelId}/member/{memberId}`

Removes an issue security level member from an issue security scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the issue security scheme.
- **levelId** (path): The ID of the issue security level.
- **memberId** (path): The ID of the issue security level member to be removed.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the security scheme isn't found.

---

