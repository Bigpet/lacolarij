# Issue type screen schemes

This resource represents issue type screen schemes. Use it to:

 *  get issue type screen schemes and a list of the projects that use them.
 *  create issue type screen schemes.
 *  update issue type screen schemes.
 *  delete issue type screen schemes.
 *  associate issue type screen schemes with projects.
 *  append issue type to screen scheme mappings to issue type screen schemes.
 *  remove issue type to screen scheme mappings from issue type screen schemes.
 *  update default screen scheme of issue type screen scheme.

## Get issue type screen schemes

`GET /rest/api/3/issuetypescreenscheme`

Returns a [paginated](#pagination) list of issue type screen schemes.

Only issue type screen schemes used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of issue type screen scheme IDs. To include multiple IDs, provide an ampersand-separated list. For example, `id=10000&id=10001`.
- **queryString** (query): String used to perform a case-insensitive partial match with issue type screen scheme name.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `name` Sorts by issue type screen scheme name.
 *  `id` Sorts by issue type screen scheme ID.
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts `projects` that, for each issue type screen schemes, returns information about the projects the issue type screen scheme is assigned to.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Create issue type screen scheme

`POST /rest/api/3/issuetypescreenscheme`

Creates an issue type screen scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeScreenSchemeDetails"
}
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type or screen scheme is not found.
- **409**: Returned if the issue type is a sub-task, but sub-tasks are disabled in Jira settings.

---

## Get issue type screen scheme items

`GET /rest/api/3/issuetypescreenscheme/mapping`

Returns a [paginated](#pagination) list of issue type screen scheme items.

Only issue type screen schemes used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **issueTypeScreenSchemeId** (query): The list of issue type screen scheme IDs. To include multiple issue type screen schemes, separate IDs with ampersand: `issueTypeScreenSchemeId=10000&issueTypeScreenSchemeId=10001`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Get issue type screen schemes for projects

`GET /rest/api/3/issuetypescreenscheme/project`

Returns a [paginated](#pagination) list of issue type screen schemes and, for each issue type screen scheme, a list of the projects that use it.

Only issue type screen schemes used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **projectId** (query): The list of project IDs. To include multiple projects, separate IDs with ampersand: `projectId=10000&projectId=10001`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Assign issue type screen scheme to project

`PUT /rest/api/3/issuetypescreenscheme/project`

Assigns an issue type screen scheme to a project.

Issue type screen schemes can only be assigned to classic projects.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeScreenSchemeProjectAssociation"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if:

 *  project is not found.
 *  issue type screen scheme is not found.
 *  the project is not a classic project.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type screen scheme or the project are missing.

---

## Delete issue type screen scheme

`DELETE /rest/api/3/issuetypescreenscheme/{issueTypeScreenSchemeId}`

Deletes an issue type screen scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeScreenSchemeId** (path): The ID of the issue type screen scheme.

### Responses

- **204**: Returned if the issue type screen scheme is deleted.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type screen scheme is not found.

---

## Update issue type screen scheme

`PUT /rest/api/3/issuetypescreenscheme/{issueTypeScreenSchemeId}`

Updates an issue type screen scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeScreenSchemeId** (path): The ID of the issue type screen scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeScreenSchemeUpdateDetails"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type screen scheme is not found.

---

## Append mappings to issue type screen scheme

`PUT /rest/api/3/issuetypescreenscheme/{issueTypeScreenSchemeId}/mapping`

Appends issue type to screen scheme mappings to an issue type screen scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeScreenSchemeId** (path): The ID of the issue type screen scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeScreenSchemeMappingDetails"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type screen scheme, issue type, or screen scheme is not found.
- **409**: Returned if the issue type is a sub-task, but sub-tasks are disabled in Jira settings.

---

## Update issue type screen scheme default screen scheme

`PUT /rest/api/3/issuetypescreenscheme/{issueTypeScreenSchemeId}/mapping/default`

Updates the default screen scheme of an issue type screen scheme. The default screen scheme is used for all unmapped issue types.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeScreenSchemeId** (path): The ID of the issue type screen scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/UpdateDefaultScreenScheme"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type screen scheme or the screen scheme is not found, or the screen scheme isn't used in classic projects.

---

## Remove mappings from issue type screen scheme

`POST /rest/api/3/issuetypescreenscheme/{issueTypeScreenSchemeId}/mapping/remove`

Removes issue type to screen scheme mappings from an issue type screen scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeScreenSchemeId** (path): The ID of the issue type screen scheme.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueTypeIds"
}
```

### Responses

- **204**: Returned if the screen scheme mappings are removed from the issue type screen scheme.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the issue type screen scheme or one or more issue type mappings are not found.

---

## Get issue type screen scheme projects

`GET /rest/api/3/issuetypescreenscheme/{issueTypeScreenSchemeId}/project`

Returns a [paginated](#pagination) list of projects associated with an issue type screen scheme.

Only company-managed projects associated with an issue type screen scheme are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeScreenSchemeId** (path): The ID of the issue type screen scheme.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **query** (query): 

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

