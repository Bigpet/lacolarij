# Permission schemes

This resource represents permission schemes. Use it to get, create, update, and delete permission schemes as well as get, create, update, and delete details of the permissions granted in those schemes.

## Get all permission schemes

`GET /rest/api/3/permissionscheme`

Returns all permission schemes.

### About permission schemes and grants ###

A permission scheme is a collection of permission grants. A permission grant consists of a `holder` and a `permission`.

#### Holder object ####

The `holder` object contains information about the user or group being granted the permission. For example, the *Administer projects* permission is granted to a group named *Teams in space administrators*. In this case, the type is `"type": "group"`, and the parameter is the group name, `"parameter": "Teams in space administrators"` and the value is group ID, `"value": "ca85fac0-d974-40ca-a615-7af99c48d24f"`.

The `holder` object is defined by the following properties:

 *  `type` Identifies the user or group (see the list of types below).
 *  `parameter` As a group's name can change, use of `value` is recommended. The value of this property depends on the `type`. For example, if the `type` is a group, then you need to specify the group name.
 *  `value` The value of this property depends on the `type`. If the `type` is a group, then you need to specify the group ID. For other `type` it has the same value as `parameter`

The following `types` are available. The expected values for `parameter` and `value` are given in parentheses (some types may not have a `parameter` or `value`):

 *  `anyone` Grant for anonymous users.
 *  `applicationRole` Grant for users with access to the specified application (application name, application name). See [Update product access settings](https://confluence.atlassian.com/x/3YxjL) for more information.
 *  `assignee` Grant for the user currently assigned to an issue.
 *  `group` Grant for the specified group (`parameter` : group name, `value` : group ID).
 *  `groupCustomField` Grant for a user in the group selected in the specified custom field (`parameter` : custom field ID, `value` : custom field ID).
 *  `projectLead` Grant for a project lead.
 *  `projectRole` Grant for the specified project role (`parameter` :project role ID, `value` : project role ID).
 *  `reporter` Grant for the user who reported the issue.
 *  `sd.customer.portal.only` Jira Service Desk only. Grants customers permission to access the customer portal but not Jira. See [Customizing Jira Service Desk permissions](https://confluence.atlassian.com/x/24dKLg) for more information.
 *  `user` Grant for the specified user (`parameter` : user ID - historically this was the userkey but that is deprecated and the account ID should be used, `value` : user ID).
 *  `userCustomField` Grant for a user selected in the specified custom field (`parameter` : custom field ID, `value` : custom field ID).

#### Built-in permissions ####

The [built-in Jira permissions](https://confluence.atlassian.com/x/yodKLg) are listed below. Apps can also define custom permissions. See the [project permission](https://developer.atlassian.com/cloud/jira/platform/modules/project-permission/) and [global permission](https://developer.atlassian.com/cloud/jira/platform/modules/global-permission/) module documentation for more information.

**Administration permissions**

 *  `ADMINISTER_PROJECTS`
 *  `EDIT_WORKFLOW`
 *  `EDIT_ISSUE_LAYOUT`

**Project permissions**

 *  `BROWSE_PROJECTS`
 *  `MANAGE_SPRINTS_PERMISSION` (Jira Software only)
 *  `SERVICEDESK_AGENT` (Jira Service Desk only)
 *  `VIEW_DEV_TOOLS` (Jira Software only)
 *  `VIEW_READONLY_WORKFLOW`

**Issue permissions**

 *  `ASSIGNABLE_USER`
 *  `ASSIGN_ISSUES`
 *  `CLOSE_ISSUES`
 *  `CREATE_ISSUES`
 *  `DELETE_ISSUES`
 *  `EDIT_ISSUES`
 *  `LINK_ISSUES`
 *  `MODIFY_REPORTER`
 *  `MOVE_ISSUES`
 *  `RESOLVE_ISSUES`
 *  `SCHEDULE_ISSUES`
 *  `SET_ISSUE_SECURITY`
 *  `TRANSITION_ISSUES`

**Voters and watchers permissions**

 *  `MANAGE_WATCHERS`
 *  `VIEW_VOTERS_AND_WATCHERS`

**Comments permissions**

 *  `ADD_COMMENTS`
 *  `DELETE_ALL_COMMENTS`
 *  `DELETE_OWN_COMMENTS`
 *  `EDIT_ALL_COMMENTS`
 *  `EDIT_OWN_COMMENTS`

**Attachments permissions**

 *  `CREATE_ATTACHMENTS`
 *  `DELETE_ALL_ATTACHMENTS`
 *  `DELETE_OWN_ATTACHMENTS`

**Time tracking permissions**

 *  `DELETE_ALL_WORKLOGS`
 *  `DELETE_OWN_WORKLOGS`
 *  `EDIT_ALL_WORKLOGS`
 *  `EDIT_OWN_WORKLOGS`
 *  `WORK_ON_ISSUES`

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Create permission scheme

`POST /rest/api/3/permissionscheme`

Creates a new permission scheme. You can create a permission scheme with or without defining a set of permission grants.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are always included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/PermissionScheme"
}
```

### Responses

- **201**: Returned if the permission scheme is created.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission or the feature is not available in the Jira plan.

---

## Delete permission scheme

`DELETE /rest/api/3/permissionscheme/{schemeId}`

Deletes a permission scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the permission scheme being deleted.

### Responses

- **204**: Returned if the permission scheme is deleted.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the permission scheme is not found.

---

## Get permission scheme

`GET /rest/api/3/permissionscheme/{schemeId}`

Returns a permission scheme.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **schemeId** (path): The ID of the permission scheme to return.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the permission scheme is not found or the user does not have the necessary permission.

---

## Update permission scheme

`PUT /rest/api/3/permissionscheme/{schemeId}`

Updates a permission scheme. Below are some important things to note when using this resource:

 *  If a permissions list is present in the request, then it is set in the permission scheme, overwriting *all existing* grants.
 *  If you want to update only the name and description, then do not send a permissions list in the request.
 *  Sending an empty list will remove all permission grants from the permission scheme.

If you want to add or delete a permission grant instead of updating the whole list, see [Create permission grant](#api-rest-api-3-permissionscheme-schemeId-permission-post) or [Delete permission scheme entity](#api-rest-api-3-permissionscheme-schemeId-permission-permissionId-delete).

See [About permission schemes and grants](../api-group-permission-schemes/#about-permission-schemes-and-grants) for more details.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the permission scheme to update.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are always included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/PermissionScheme"
}
```

### Responses

- **200**: Returned if the scheme is updated.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if:

 *  the user does not have the necessary permission to update permission schemes.
 *  the Jira instance is Jira Core Free or Jira Software Free. Permission schemes cannot be updated on free plans.
- **404**: Returned if the permission scheme is not found.

---

## Get permission scheme grants

`GET /rest/api/3/permissionscheme/{schemeId}/permission`

Returns all permission grants for a permission scheme.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **schemeId** (path): The ID of the permission scheme.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are always included when you specify any value. Expand options include:

 *  `permissions` Returns all permission grants for each permission scheme.
 *  `user` Returns information about the user who is granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `field` Returns information about the custom field granted the permission.
 *  `all` Returns all expandable information.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the permission schemes is not found or the user does not have the necessary permission.

---

## Create permission grant

`POST /rest/api/3/permissionscheme/{schemeId}/permission`

Creates a permission grant in a permission scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the permission scheme in which to create a new permission grant.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are always included when you specify any value. Expand options include:

 *  `permissions` Returns all permission grants for each permission scheme.
 *  `user` Returns information about the user who is granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `field` Returns information about the custom field granted the permission.
 *  `all` Returns all expandable information.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/PermissionGrant"
}
```

### Responses

- **201**: Returned if the scheme permission is created.
- **400**: Returned if the value for expand is invalid or the same permission grant is present.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Delete permission scheme grant

`DELETE /rest/api/3/permissionscheme/{schemeId}/permission/{permissionId}`

Deletes a permission grant from a permission scheme. See [About permission schemes and grants](../api-group-permission-schemes/#about-permission-schemes-and-grants) for more details.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the permission scheme to delete the permission grant from.
- **permissionId** (path): The ID of the permission grant to delete.

### Responses

- **204**: Returned if the permission grant is deleted.
- **400**: Returned if permission grant with the provided ID is not found.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Get permission scheme grant

`GET /rest/api/3/permissionscheme/{schemeId}/permission/{permissionId}`

Returns a permission grant.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **schemeId** (path): The ID of the permission scheme.
- **permissionId** (path): The ID of the permission grant.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Note that permissions are always included when you specify any value. Expand options include:

 *  `all` Returns all expandable information.
 *  `field` Returns information about the custom field granted the permission.
 *  `group` Returns information about the group that is granted the permission.
 *  `permissions` Returns all permission grants for each permission scheme.
 *  `projectRole` Returns information about the project role granted the permission.
 *  `user` Returns information about the user who is granted the permission.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the permission scheme or permission grant is not found or the user does not have the necessary permission.

---

