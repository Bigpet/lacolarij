# Project versions

This resource represents project versions. Use it to get, get lists of, create, update, move, merge, and delete project versions. This resource also provides counts of issues by version.

## Get project versions paginated

`GET /rest/api/2/project/{projectIdOrKey}/version`

Returns a [paginated](#pagination) list of all versions in a project. See the [Get project versions](#api-rest-api-2-project-projectIdOrKey-versions-get) resource if you want to get a full list of versions without pagination.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `description` Sorts by version description.
 *  `name` Sorts by version name.
 *  `releaseDate` Sorts by release date, starting with the oldest date. Versions with no release date are listed last.
 *  `sequence` Sorts by the order of appearance in the user interface.
 *  `startDate` Sorts by start date, starting with the oldest date. Versions with no start date are listed last.
- **query** (query): Filter the results using a literal string. Versions with matching `name` or `description` are returned (case insensitive).
- **status** (query): A list of status values used to filter the results by version status. This parameter accepts a comma-separated list. The status values are `released`, `unreleased`, and `archived`.
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `issuesstatus` Returns the number of issues in each status category for each version.
 *  `operations` Returns actions that can be performed on the specified version.
 *  `driver` Returns the Atlassian account ID of the version driver.
 *  `approvers` Returns a list containing the approvers for this version.

### Responses

- **200**: Returned if the request is successful.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

## Get project versions

`GET /rest/api/2/project/{projectIdOrKey}/versions`

Returns all versions in a project. The response is not paginated. Use [Get project versions paginated](#api-rest-api-2-project-projectIdOrKey-version-get) if you want to get the versions in a project with pagination.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts `operations`, which returns actions that can be performed on the version.

### Responses

- **200**: Returned if the request is successful.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

## Create version

`POST /rest/api/2/version`

Creates a project version.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project the version is added to.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/Version" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the project is not found.
 *  the user does not have the required permissions.

---

## Delete version

`DELETE /rest/api/2/version/{id}`

Deletes a project version.

Deprecated, use [ Delete and replace version](#api-rest-api-2-version-id-removeAndSwap-post) that supports swapping version values in custom fields, in addition to the swapping for `fixVersion` and `affectedVersion` provided in this resource.

Alternative versions can be provided to update issues that use the deleted version in `fixVersion` or `affectedVersion`. If alternatives are not provided, occurrences of `fixVersion` and `affectedVersion` that contain the deleted version are cleared.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that contains the version.

### Parameters

- **id** (path): The ID of the version.
- **moveFixIssuesTo** (query): The ID of the version to update `fixVersion` to when the field contains the deleted version. The replacement version must be in the same project as the version being deleted and cannot be the version being deleted.
- **moveAffectedIssuesTo** (query): The ID of the version to update `affectedVersion` to when the field contains the deleted version. The replacement version must be in the same project as the version being deleted and cannot be the version being deleted.

### Responses

- **204**: Returned if the version is deleted.
- **400**: Returned if the request is invalid.
- **401**: Returned if:

 *  the authentication credentials are incorrect.
 *  the user does not have the required permissions.
- **404**: Returned if the version is not found.

---

## Get version

`GET /rest/api/2/version/{id}`

Returns a project version.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the version.

### Parameters

- **id** (path): The ID of the version.
- **expand** (query): Use [expand](#expansion) to include additional information about version in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `operations` Returns the list of operations available for this version.
 *  `issuesstatus` Returns the count of issues in this version for each of the status categories *to do*, *in progress*, *done*, and *unmapped*. The *unmapped* property represents the number of issues with a status other than *to do*, *in progress*, and *done*.
 *  `driver` Returns the Atlassian account ID of the version driver.
 *  `approvers` Returns a list containing the Atlassian account IDs of approvers for this version.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the version is not found or the user does not have the necessary permission.

---

## Update version

`PUT /rest/api/2/version/{id}`

Updates a project version.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that contains the version.

### Parameters

- **id** (path): The ID of the version.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/Version" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:

 *  the request is invalid.
 *  the user does not have the required permissions.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the version is not found.

---

## Merge versions

`PUT /rest/api/2/version/{id}/mergeto/{moveIssuesTo}`

Merges two project versions. The merge is completed by deleting the version specified in `id` and replacing any occurrences of its ID in `fixVersion` with the version ID specified in `moveIssuesTo`.

Consider using [ Delete and replace version](#api-rest-api-2-version-id-removeAndSwap-post) instead. This resource supports swapping version values in `fixVersion`, `affectedVersion`, and custom fields.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that contains the version.

### Parameters

- **id** (path): The ID of the version to delete.
- **moveIssuesTo** (path): The ID of the version to merge into.

### Responses

- **204**: Returned if the version is deleted.
- **400**: Returned if the request is invalid.
- **401**: Returned if:

 *  the authentication credentials are incorrect or missing.
 *  the user does not have the required permissions.
- **404**: Returned if the version to be deleted or the version to merge to are not found.

---

## Move version

`POST /rest/api/2/version/{id}/move`

Modifies the version's sequence within the project, which affects the display order of the versions in Jira.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* project permission for the project that contains the version.

### Parameters

- **id** (path): The ID of the version to be moved.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/VersionMoveBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:

 *  no body parameters are provided.
 *  `after` and `position` are provided.
 *  `position` is invalid.
- **401**: Returned if:

 *  the authentication credentials are incorrect or missing
 *  the user does not have the required commissions.
- **404**: Returned if the version or move after version are not found.

---

## Get version's related issues count

`GET /rest/api/2/version/{id}/relatedIssueCounts`

Returns the following counts for a version:

 *  Number of issues where the `fixVersion` is set to the version.
 *  Number of issues where the `affectedVersion` is set to the version.
 *  Number of issues where a version custom field is set to the version.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* project permission for the project that contains the version.

### Parameters

- **id** (path): The ID of the version.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if:

 *  the version is not found.
 *  the user does not have the required permissions.

---

## Get related work

`GET /rest/api/2/version/{id}/relatedwork`

Returns related work items for the given version id.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the version.

### Parameters

- **id** (path): The ID of the version.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the version is not found or the user does not have the necessary permission.
- **500**: Returned if reading related work fails

---

## Create related work

`POST /rest/api/2/version/{id}/relatedwork`

Creates a related work for the given version. You can only create a generic link type of related works via this API. relatedWorkId will be auto-generated UUID, that does not need to be provided.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Resolve issues:* and *Edit issues* [Managing project permissions](https://confluence.atlassian.com/adminjiraserver/managing-project-permissions-938847145.html) for the project that contains the version.

### Parameters

- **id** (path): 

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/VersionRelatedWork" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the version is not found.

---

## Update related work

`PUT /rest/api/2/version/{id}/relatedwork`

Updates the given related work. You can only update generic link related works via Rest APIs. Any archived version related works can't be edited.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Resolve issues:* and *Edit issues* [Managing project permissions](https://confluence.atlassian.com/adminjiraserver/managing-project-permissions-938847145.html) for the project that contains the version.

### Parameters

- **id** (path): The ID of the version to update the related work on. For the related work id, pass it to the input JSON.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/VersionRelatedWork" }
```

### Responses

- **200**: Returned if the request is successful together with updated related work.
- **400**: Returned if the request data is invalid
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the version or the related work is not found.

---

## Delete and replace version

`POST /rest/api/2/version/{id}/removeAndSwap`

Deletes a project version.

Alternative versions can be provided to update issues that use the deleted version in `fixVersion`, `affectedVersion`, or any version picker custom fields. If alternatives are not provided, occurrences of `fixVersion`, `affectedVersion`, and any version picker custom field, that contain the deleted version, are cleared. Any replacement version must be in the same project as the version being deleted and cannot be the version being deleted.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that contains the version.

### Parameters

- **id** (path): The ID of the version.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DeleteAndReplaceVersionBean" }
```

### Responses

- **204**: Returned if the version is deleted.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the version to delete is not found.
 *  the user does not have the required permissions.

---

## Get version's unresolved issues count

`GET /rest/api/2/version/{id}/unresolvedIssueCount`

Returns counts of the issues and unresolved issues for the project version.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* project permission for the project that contains the version.

### Parameters

- **id** (path): The ID of the version.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the version is not found.
 *  the user does not have the required permissions.

---

## Delete related work

`DELETE /rest/api/2/version/{versionId}/relatedwork/{relatedWorkId}`

Deletes the given related work for the given version.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Resolve issues:* and *Edit issues* [Managing project permissions](https://confluence.atlassian.com/adminjiraserver/managing-project-permissions-938847145.html) for the project that contains the version.

### Parameters

- **versionId** (path): The ID of the version that the target related work belongs to.
- **relatedWorkId** (path): The ID of the related work to delete.

### Responses

- **204**: Returned if the related work is deleted.
- **400**: Returned if the request is invalid.
- **401**: Returned if

the authentication credentials are incorrect.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the version/related work is not found.

---

