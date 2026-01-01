# Project role actors

This resource represents the users assigned to [project roles](#api-group-Issue-comments). Use it to get, add, and remove default users from project roles. Also use it to add and remove users from a project role associated with a project.

## Delete actors from project role

`DELETE /rest/api/3/project/{projectIdOrKey}/role/{id}`

Deletes actors from a project role for the project.

To remove default actors from the project role, use [Delete default actors from project role](#api-rest-api-3-role-id-actors-delete).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project or *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **id** (path): The ID of the project role. Use [Get all project roles](#api-rest-api-3-role-get) to get a list of project role IDs.
- **user** (query): The user account ID of the user to remove from the project role.
- **group** (query): The name of the group to remove from the project role. This parameter cannot be used with the `groupId` parameter. As a group's name can change, use of `groupId` is recommended.
- **groupId** (query): The ID of the group to remove from the project role. This parameter cannot be used with the `group` parameter.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **404**: Returned if:

 *  the project or project role is not found.
 *  the calling user does not have administrative permission.

---

## Add actors to project role

`POST /rest/api/3/project/{projectIdOrKey}/role/{id}`

Adds actors to a project role for the project.

To replace all actors for the project, use [Set actors for project role](#api-rest-api-3-project-projectIdOrKey-role-id-put).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project or *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **id** (path): The ID of the project role. Use [Get all project roles](#api-rest-api-3-role-get) to get a list of project role IDs.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ActorsMap"
}
```

### Responses

- **200**: Returned if the request is successful. The complete list of actors for the project is returned.

For example, the cURL request above adds a group, *jira-developers*. For the response below to be returned as a result of that request, the user *Mia Krystof* would have previously been added as a `user` actor for this project.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing or if the calling user lacks administrative permissions for the project.
- **404**: Returned if:

 *  the project is not found.
 *  the user or group is not found.
 *  the group or user is not active.

---

## Set actors for project role

`PUT /rest/api/3/project/{projectIdOrKey}/role/{id}`

Sets the actors for a project role for a project, replacing all existing actors.

To add actors to the project without overwriting the existing list, use [Add actors to project role](#api-rest-api-3-project-projectIdOrKey-role-id-post).

**[Permissions](#permissions) required:** *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project or *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **id** (path): The ID of the project role. Use [Get all project roles](#api-rest-api-3-role-get) to get a list of project role IDs.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ProjectRoleActorsUpdateBean"
}
```

### Responses

- **200**: Returned if the request is successful. The complete list of actors for the project is returned.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing or if the calling user lacks administrative permissions for the project.
- **404**: Returned if:

 *  the project is not found.
 *  a user or group is not found.
 *  a group or user is not active.

---

## Delete default actors from project role

`DELETE /rest/api/3/role/{id}/actors`

Deletes the [default actors](#api-rest-api-3-resolution-get) from a project role. You may delete a group or user, but you cannot delete a group and a user in the same request.

Changing a project role's default actors does not affect project role members for projects already created.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the project role. Use [Get all project roles](#api-rest-api-3-role-get) to get a list of project role IDs.
- **user** (query): The user account ID of the user to remove as a default actor.
- **groupId** (query): The group ID of the group to be removed as a default actor. This parameter cannot be used with the `group` parameter.
- **group** (query): The group name of the group to be removed as a default actor.This parameter cannot be used with the `groupId` parameter. As a group's name can change, use of `groupId` is recommended.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have administrative permissions.
- **404**: Returned if the project role is not found.

---

## Get default actors for project role

`GET /rest/api/3/role/{id}/actors`

Returns the [default actors](#api-rest-api-3-resolution-get) for the project role.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the project role. Use [Get all project roles](#api-rest-api-3-role-get) to get a list of project role IDs.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have administrative permissions.
- **404**: Returned if the project role is not found.

---

## Add default actors to project role

`POST /rest/api/3/role/{id}/actors`

Adds [default actors](#api-rest-api-3-resolution-get) to a role. You may add groups or users, but you cannot add groups and users in the same request.

Changing a project role's default actors does not affect project role members for projects already created.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the project role. Use [Get all project roles](#api-rest-api-3-role-get) to get a list of project role IDs.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ActorInputBean"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have administrative permissions.
- **404**: Returned if the project role is not found.

---

