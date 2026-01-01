# Groups

This resource represents groups of users. Use it to get, create, find, and delete groups as well as add and remove users from groups. (\[WARNING\] The standard Atlassian group names are default names only and can be edited or deleted. For example, an admin or Atlassian support could delete the default group jira-software-users or rename it to jsw-users at any point. See https://support.atlassian.com/user-management/docs/create-and-update-groups/ for details.)

## Remove group

`DELETE /rest/api/2/group`

Deletes a group.

**[Permissions](#permissions) required:** Site administration (that is, member of the *site-admin* strategic [group](https://confluence.atlassian.com/x/24xjL)).

### Parameters

- **groupname** (query): 
- **groupId** (query): The ID of the group. This parameter cannot be used with the `groupname` parameter.
- **swapGroup** (query): As a group's name can change, use of `swapGroupId` is recommended to identify a group.  
The group to transfer restrictions to. Only comments and worklogs are transferred. If restrictions are not transferred, comments and worklogs are inaccessible after the deletion. This parameter cannot be used with the `swapGroupId` parameter.
- **swapGroupId** (query): The ID of the group to transfer restrictions to. Only comments and worklogs are transferred. If restrictions are not transferred, comments and worklogs are inaccessible after the deletion. This parameter cannot be used with the `swapGroup` parameter.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the group name is not specified.
- **401**: Returned if the authentication credentials are incorrect or missing from the request.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the group is not found.

---

## Get group

`GET /rest/api/2/group`

This operation is deprecated, use [`group/member`](#api-rest-api-2-group-member-get).

Returns all users in a group.

**[Permissions](#permissions) required:** either of:

 *  *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).
 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **groupname** (query): As a group's name can change, use of `groupId` is recommended to identify a group.  
The name of the group. This parameter cannot be used with the `groupId` parameter.
- **groupId** (query): The ID of the group. This parameter cannot be used with the `groupName` parameter.
- **expand** (query): List of fields to expand.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the group name is not specified.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the calling user does not have the Administer Jira global permission.
- **404**: Returned if the group is not found.

---

## Create group

`POST /rest/api/2/group`

Creates a group.

**[Permissions](#permissions) required:** Site administration (that is, member of the *site-admin* [group](https://confluence.atlassian.com/x/24xjL)).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/AddGroupBean" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if group name is not specified or the group name is in use.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Bulk get groups

`GET /rest/api/2/group/bulk`

Returns a [paginated](#pagination) list of groups.

**[Permissions](#permissions) required:** *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **groupId** (query): The ID of a group. To specify multiple IDs, pass multiple `groupId` parameters. For example, `groupId=5b10a2844c20165700ede21g&groupId=5b10ac8d82e05b22cc7d4ef5`.
- **groupName** (query): The name of a group. To specify multiple names, pass multiple `groupName` parameters. For example, `groupName=administrators&groupName=jira-software-users`.
- **accessType** (query): The access level of a group. Valid values: 'site-admin', 'admin', 'user'.
- **applicationKey** (query): The application key of the product user groups to search for. Valid values: 'jira-servicedesk', 'jira-software', 'jira-product-discovery', 'jira-core'.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **500**: Returned if the group with the given access level can't be retrieved.

---

## Get users from group

`GET /rest/api/2/group/member`

Returns a [paginated](#pagination) list of all users in a group.

Note that users are ordered by username, however the username is not returned in the results due to privacy reasons.

**[Permissions](#permissions) required:** either of:

 *  *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).
 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **groupname** (query): As a group's name can change, use of `groupId` is recommended to identify a group.  
The name of the group. This parameter cannot be used with the `groupId` parameter.
- **groupId** (query): The ID of the group. This parameter cannot be used with the `groupName` parameter.
- **includeInactiveUsers** (query): Include inactive users.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page (number should be between 1 and 50).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the group name is not specified.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the calling user does not have the Administer Jira global permission.
- **404**: Returned if the group is not found.

---

## Remove user from group

`DELETE /rest/api/2/group/user`

Removes a user from a group.

**[Permissions](#permissions) required:** Site administration (that is, member of the *site-admin* [group](https://confluence.atlassian.com/x/24xjL)).

### Parameters

- **groupname** (query): As a group's name can change, use of `groupId` is recommended to identify a group.  
The name of the group. This parameter cannot be used with the `groupId` parameter.
- **groupId** (query): The ID of the group. This parameter cannot be used with the `groupName` parameter.
- **username** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.
- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:

 *  `groupName` is missing.
 *  `accountId` is missing.
- **401**: Returned if the authentication credentials are incorrect or missing from the request.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the group or user are not found.

---

## Add user to group

`POST /rest/api/2/group/user`

Adds a user to a group.

**[Permissions](#permissions) required:** Site administration (that is, member of the *site-admin* [group](https://confluence.atlassian.com/x/24xjL)).

### Parameters

- **groupname** (query): As a group's name can change, use of `groupId` is recommended to identify a group.  
The name of the group. This parameter cannot be used with the `groupId` parameter.
- **groupId** (query): The ID of the group. This parameter cannot be used with the `groupName` parameter.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateUserToGroupBean" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if:

 *  `groupname` is not provided.
 *  `accountId` is missing.
- **401**: Returned if the authentication credentials are incorrect or missing from the request.
- **403**: Returned if the calling user does not have the necessary permission.
- **404**: Returned if the group or user are not found.
- **429**: Returned if rate limiting is being enforced.

---

## Find groups

`GET /rest/api/2/groups/picker`

Returns a list of groups whose names contain a query string. A list of group names can be provided to exclude groups from the results.

The primary use case for this resource is to populate a group picker suggestions list. To this end, the returned object includes the `html` field where the matched query term is highlighted in the group name with the HTML strong tag. Also, the groups list is wrapped in a response object that contains a header for use in the picker, specifically *Showing X of Y matching groups*.

The list returns with the groups sorted. If no groups match the list criteria, an empty list is returned.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg). Anonymous calls and calls by users without the required permission return an empty list.

*Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg). Without this permission, calls where query is not an exact match to an existing group will return an empty list.

### Parameters

- **accountId** (query): This parameter is deprecated, setting it does not affect the results. To find groups containing a particular user, use [Get user groups](#api-rest-api-2-user-groups-get).
- **query** (query): The string to find in group names.
- **exclude** (query): As a group's name can change, use of `excludeGroupIds` is recommended to identify a group.  
A group to exclude from the result. To exclude multiple groups, provide an ampersand-separated list. For example, `exclude=group1&exclude=group2`. This parameter cannot be used with the `excludeGroupIds` parameter.
- **excludeId** (query): A group ID to exclude from the result. To exclude multiple groups, provide an ampersand-separated list. For example, `excludeId=group1-id&excludeId=group2-id`. This parameter cannot be used with the `excludeGroups` parameter.
- **maxResults** (query): The maximum number of groups to return. The maximum number of groups that can be returned is limited by the system property `jira.ajax.autocomplete.limit`.
- **caseInsensitive** (query): Whether the search for groups should be case insensitive.
- **userName** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.

### Responses

- **200**: Returned if the request is successful.

---

