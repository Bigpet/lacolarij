# Project permission schemes

This resource represents permission schemes for a project. Use this resource to:

 *  get details of a project's issue security levels available to the calling user.
 *  get the permission scheme associated with the project or assign different permission scheme to the project.
 *  get details of a project's issue security scheme.

See [Managing project permissions](https://confluence.atlassian.com/x/yodKLg) for more information about permission schemes.

## Get project issue security scheme

`GET /rest/api/2/project/{projectKeyOrId}/issuesecuritylevelscheme`

Returns the [issue security scheme](https://confluence.atlassian.com/x/J4lKLg) associated with the project.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or the *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg).

### Parameters

- **projectKeyOrId** (path): The project ID or project key (case sensitive).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the project is visible to the user but the user doesn't have administrative permissions.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

## Get assigned permission scheme

`GET /rest/api/2/project/{projectKeyOrId}/permissionscheme`

Gets the [permission scheme](https://confluence.atlassian.com/x/yodKLg) associated with the project.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg).

### Parameters

- **projectKeyOrId** (path): The project ID or project key (case sensitive).
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to view the project's configuration.
- **404**: Returned if the project is not found or the user does not have permission to view the project.

---

## Assign permission scheme

`PUT /rest/api/2/project/{projectKeyOrId}/permissionscheme`

Assigns a permission scheme with a project. See [Managing project permissions](https://confluence.atlassian.com/x/yodKLg) for more information about permission schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg)

### Parameters

- **projectKeyOrId** (path): The project ID or project key (case sensitive).
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IdBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if:

 *  the user does not have the necessary permission to edit the project's configuration.
 *  the Jira instance is Jira Core Free or Jira Software Free. Permission schemes cannot be assigned to projects on free plans.
- **404**: Returned if the project or permission scheme is not found.

---

## Get project issue security levels

`GET /rest/api/2/project/{projectKeyOrId}/securitylevel`

Returns all [issue security](https://confluence.atlassian.com/x/J4lKLg) levels for the project that the user has access to.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [global permission](https://confluence.atlassian.com/x/x4dKLg) for the project, however, issue security levels are only returned for authenticated user with *Set Issue Security* [global permission](https://confluence.atlassian.com/x/x4dKLg) for the project.

### Parameters

- **projectKeyOrId** (path): The project ID or project key (case sensitive).

### Responses

- **200**: Returned if the request is successful.
- **404**: Returned if the project is not found or the user does not have permission to view it.

---

