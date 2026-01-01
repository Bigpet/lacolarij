# Filter sharing

This resource represents options for sharing [filters](#api-group-Filters). Use it to get share scopes as well as add and remove share scopes from filters.

## Get default share scope

`GET /rest/api/2/filter/defaultShareScope`

Returns the default sharing settings for new filters and dashboards for a user.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Set default share scope

`PUT /rest/api/2/filter/defaultShareScope`

Sets the default sharing for new filters and dashboards for a user.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DefaultShareScope" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if an invalid scope is set.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get share permissions

`GET /rest/api/2/filter/{id}/permission`

Returns the share permissions for a filter. A filter can be shared with groups, projects, all logged-in users, or the public. Sharing with all logged-in users or the public is known as a global share permission.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None, however, share permissions are only returned for:

 *  filters owned by the user.
 *  filters shared with a group that the user is a member of.
 *  filters shared with a private project that the user has *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for.
 *  filters shared with a public project.
 *  filters shared with the public.

### Parameters

- **id** (path): The ID of the filter.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the filter is not found.
 *  the user does not have permission to view the filter.

---

## Add share permission

`POST /rest/api/2/filter/{id}/permission`

Add a share permissions to a filter. If you add a global share permission (one for all logged-in users or the public) it will overwrite all share permissions for the filter.

Be aware that this operation uses different objects for updating share permissions compared to [Update filter](#api-rest-api-2-filter-id-put).

**[Permissions](#permissions) required:** *Share dashboards and filters* [global permission](https://confluence.atlassian.com/x/x4dKLg) and the user must own the filter.

### Parameters

- **id** (path): The ID of the filter.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SharePermissionInputBean" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if:

 *  the request object is invalid. For example, it contains an invalid type, the ID does not match the type, or the project or group is not found.
 *  the user does not own the filter.
 *  the user does not have the required permissions.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the filter is not found.
 *  the user does not have permission to view the filter.

---

## Delete share permission

`DELETE /rest/api/2/filter/{id}/permission/{permissionId}`

Deletes a share permission from a filter.

**[Permissions](#permissions) required:** Permission to access Jira and the user must own the filter.

### Parameters

- **id** (path): The ID of the filter.
- **permissionId** (path): The ID of the share permission.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the filter is not found.
 *  the user does not own the filter.

---

## Get share permission

`GET /rest/api/2/filter/{id}/permission/{permissionId}`

Returns a share permission for a filter. A filter can be shared with groups, projects, all logged-in users, or the public. Sharing with all logged-in users or the public is known as a global share permission.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None, however, a share permission is only returned for:

 *  filters owned by the user.
 *  filters shared with a group that the user is a member of.
 *  filters shared with a private project that the user has *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for.
 *  filters shared with a public project.
 *  filters shared with the public.

### Parameters

- **id** (path): The ID of the filter.
- **permissionId** (path): The ID of the share permission.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the filter is not found.
 *  the permission is not found.
 *  the user does not have permission to view the filter.

---

