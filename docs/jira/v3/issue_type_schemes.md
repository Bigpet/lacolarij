# Issue type schemes

This resource represents issue type schemes in classic projects. Use it to:

 *  get issue type schemes and a list of the projects that use them.
 *  associate issue type schemes with projects.
 *  add issue types to issue type schemes.
 *  delete issue types from issue type schemes.
 *  create, update, and delete issue type schemes.
 *  change the order of issue types in issue type schemes.

## Get all issue type schemes

`GET /rest/api/3/issuetypescheme`

Returns a [paginated](#pagination) list of issue type schemes.

Only issue type schemes used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of issue type schemes IDs. To include multiple IDs, provide an ampersand-separated list. For example, `id=10000&id=10001`.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `name` Sorts by issue type scheme name.
 *  `id` Sorts by issue type scheme ID.
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `projects` For each issue type schemes, returns information about the projects the issue type scheme is assigned to.
 *  `issueTypes` For each issue type schemes, returns information about the issueTypes the issue type scheme have.
- **queryString** (query): String used to perform a case-insensitive partial match with issue type scheme name.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Create issue type scheme

`POST /rest/api/3/issuetypescheme`

Creates an issue type scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeSchemeDetails"
}
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **409**: Returned if the scheme name is used by another scheme.

---

## Get issue type scheme items

`GET /rest/api/3/issuetypescheme/mapping`

Returns a [paginated](#pagination) list of issue type scheme items.

Only issue type scheme items used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **issueTypeSchemeId** (query): The list of issue type scheme IDs. To include multiple IDs, provide an ampersand-separated list. For example, `issueTypeSchemeId=10000&issueTypeSchemeId=10001`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Get issue type schemes for projects

`GET /rest/api/3/issuetypescheme/project`

Returns a [paginated](#pagination) list of issue type schemes and, for each issue type scheme, a list of the projects that use it.

Only issue type schemes used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **projectId** (query): The list of project IDs. To include multiple project IDs, provide an ampersand-separated list. For example, `projectId=10000&projectId=10001`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Assign issue type scheme to project

`PUT /rest/api/3/issuetypescheme/project`

Assigns an issue type scheme to a project.

If any issues in the project are assigned issue types not present in the new scheme, the operation will fail. To complete the assignment those issues must be updated to use issue types in the new scheme.

Issue type schemes can only be assigned to classic projects.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeSchemeProjectAssociation"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type scheme or the project is not found.

---

## Delete issue type scheme

`DELETE /rest/api/3/issuetypescheme/{issueTypeSchemeId}`

Deletes an issue type scheme.

Only issue type schemes used in classic projects can be deleted.

Any projects assigned to the scheme are reassigned to the default issue type scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeSchemeId** (path): The ID of the issue type scheme.

### Responses

- **204**: Returned if the issue type scheme is deleted.
- **400**: Returned if the request is to delete the default issue type scheme.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type scheme is not found.

---

## Update issue type scheme

`PUT /rest/api/3/issuetypescheme/{issueTypeSchemeId}`

Updates an issue type scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeSchemeId** (path): The ID of the issue type scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeSchemeUpdateDetails"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type scheme is not found.

---

## Add issue types to issue type scheme

`PUT /rest/api/3/issuetypescheme/{issueTypeSchemeId}/issuetype`

Adds issue types to an issue type scheme.

The added issue types are appended to the issue types list.

If any of the issue types exist in the issue type scheme, the operation fails and no issue types are added.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeSchemeId** (path): The ID of the issue type scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeIds"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type or the issue type scheme is not found.

---

## Change order of issue types

`PUT /rest/api/3/issuetypescheme/{issueTypeSchemeId}/issuetype/move`

Changes the order of issue types in an issue type scheme.

The request body parameters must meet the following requirements:

 *  all of the issue types must belong to the issue type scheme.
 *  either `after` or `position` must be provided.
 *  the issue type in `after` must not be in the issue type list.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeSchemeId** (path): The ID of the issue type scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/OrderOfIssueTypes"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type scheme is not found.

---

## Remove issue type from issue type scheme

`DELETE /rest/api/3/issuetypescheme/{issueTypeSchemeId}/issuetype/{issueTypeId}`

Removes an issue type from an issue type scheme.

This operation cannot remove:

 *  any issue type used by issues.
 *  any issue types from the default issue type scheme.
 *  the last standard issue type from an issue type scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeSchemeId** (path): The ID of the issue type scheme.
- **issueTypeId** (path): The ID of the issue type.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type scheme is missing or the issue type is not found in the issue type scheme.

---

