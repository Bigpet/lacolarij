# Users

This resource represent users. Use it to:

 *  get, get a list of, create, and delete users.
 *  get, set, and reset a user's default issue table columns.
 *  get a list of the groups the user belongs to.
 *  get a list of user account IDs for a list of usernames or user keys.

## Delete user

`DELETE /rest/api/2/user`

Deletes a user. If the operation completes successfully then the user is removed from Jira's user base. This operation does not delete the user's Atlassian account.

**[Permissions](#permissions) required:** Site administration (that is, membership of the *site-admin* [group](https://confluence.atlassian.com/x/24xjL)).

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*.
- **username** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.
- **key** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the user cannot be removed.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the user is not found.

---

## Get user

`GET /rest/api/2/user`

Returns a user.

Privacy controls are applied to the response based on the user's preferences. This could mean, for example, that the user's email address is hidden. See the [Profile visibility overview](https://developer.atlassian.com/cloud/jira/platform/profile-visibility/) for more details.

**[Permissions](#permissions) required:** *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*. Required.
- **username** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide) for details.
- **key** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide) for details.
- **expand** (query): Use [expand](#expansion) to include additional information about users in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `groups` includes all groups and nested groups to which the user belongs.
 *  `applicationRoles` includes details of all the applications to which the user has access.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the calling user does not have the *Browse users and groups* global permission.
- **404**: Returned if the user is not found.

---

## Create user

`POST /rest/api/2/user`

Creates a user. This resource is retained for legacy compatibility. As soon as a more suitable alternative is available this resource will be deprecated.

If the user exists and has access to Jira, the operation returns a 201 status. If the user exists but does not have access to Jira, the operation returns a 400 status.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/NewUserDetails" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid or the number of licensed users is exceeded.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Bulk get users

`GET /rest/api/2/user/bulk`

Returns a [paginated](#pagination) list of the users specified by one or more account IDs.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **username** (query): This parameter is no longer available and will be removed from the documentation soon. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.
- **key** (query): This parameter is no longer available and will be removed from the documentation soon. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.
- **accountId** (query): The account ID of a user. To specify multiple users, pass multiple `accountId` parameters. For example, `accountId=5b10a2844c20165700ede21g&accountId=5b10ac8d82e05b22cc7d4ef5`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if `accountID` is missing.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get account IDs for users

`GET /rest/api/2/user/bulk/migration`

Returns the account IDs for the users specified in the `key` or `username` parameters. Note that multiple `key` or `username` parameters can be specified.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **username** (query): Username of a user. To specify multiple users, pass multiple copies of this parameter. For example, `username=fred&username=barney`. Required if `key` isn't provided. Cannot be provided if `key` is present.
- **key** (query): Key of a user. To specify multiple users, pass multiple copies of this parameter. For example, `key=fred&key=barney`. Required if `username` isn't provided. Cannot be provided if `username` is present.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if `key` or `username`
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Reset user default columns

`DELETE /rest/api/2/user/columns`

Resets the default [ issue table columns](https://confluence.atlassian.com/x/XYdKLg) for the user to the system default. If `accountId` is not passed, the calling user's default columns are reset.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg), to set the columns on any user.
 *  Permission to access Jira, to set the calling user's columns.

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*.
- **username** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission or is not accessing their user record.

---

## Get user default columns

`GET /rest/api/2/user/columns`

Returns the default [issue table columns](https://confluence.atlassian.com/x/XYdKLg) for the user. If `accountId` is not passed in the request, the calling user's details are returned.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLgl), to get the column details for any user.
 *  Permission to access Jira, to get the calling user's column details.

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*.
- **username** (query): This parameter is no longer available See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission or is not accessing their user record.
- **404**: Returned if the requested user is not found.

---

## Set user default columns

`PUT /rest/api/2/user/columns`

Sets the default [ issue table columns](https://confluence.atlassian.com/x/XYdKLg) for the user. If an account ID is not passed, the calling user's default columns are set. If no column details are sent, then all default columns are removed.

The parameters for this resource are expressed as HTML form data. For example, in curl:

`curl -X PUT -d columns=summary -d columns=description https://your-domain.atlassian.net/rest/api/2/user/columns?accountId=5b10ac8d82e05b22cc7d4ef5'`

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg), to set the columns on any user.
 *  Permission to access Jira, to set the calling user's columns.

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission or is not accessing their user record.
- **404**: Returned if the requested user is not found.
- **429**: Returned if the rate limit is exceeded. User search endpoints share a collective rate limit for the tenant, in addition to Jira's normal rate limiting you may receive a rate limit for user search. Please respect the Retry-After header.
- **500**: Returned if an invalid issue table column ID is sent.

---

## Get user email

`GET /rest/api/2/user/email`

Returns a user's email address regardless of the user's profile visibility settings. For Connect apps, this API is only available to apps approved by Atlassian, according to these [guidelines](https://community.developer.atlassian.com/t/guidelines-for-requesting-access-to-email-address/27603). For Forge apps, this API only supports access via asApp() requests.

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, `5b10ac8d82e05b22cc7d4ef5`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the calling app is not approved to use this API.
- **401**: Returned if the authentication credentials are incorrect or missing from the request (for example if a user is trying to access this API).
- **404**: Returned if a user with the given `accountId` doesn't exist
- **503**: Indicates the API is not currently enabled

---

## Get user email bulk

`GET /rest/api/2/user/email/bulk`

Returns a user's email address regardless of the user's profile visibility settings. For Connect apps, this API is only available to apps approved by Atlassian, according to these [guidelines](https://community.developer.atlassian.com/t/guidelines-for-requesting-access-to-email-address/27603). For Forge apps, this API only supports access via asApp() requests.

### Parameters

- **accountId** (query): The account IDs of the users for which emails are required. An `accountId` is an identifier that uniquely identifies the user across all Atlassian products. For example, `5b10ac8d82e05b22cc7d4ef5`. Note, this should be treated as an opaque identifier (that is, do not assume any structure in the value).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the calling app is not approved to use this API.
- **401**: Returned if the authentication credentials are incorrect, or missing from the request (for example if a user is trying to access this API).
- **503**: Indicates the API is not currently enabled.

---

## Get user groups

`GET /rest/api/2/user/groups`

Returns the groups to which a user belongs.

**[Permissions](#permissions) required:** *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **accountId** (query): The account ID of the user, which uniquely identifies the user across all Atlassian products. For example, *5b10ac8d82e05b22cc7d4ef5*.
- **username** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.
- **key** (query): This parameter is no longer available. See the [deprecation notice](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the calling user does not have the *Browse users and groups* global permission.
- **404**: Returned if the user is not found.

---

## Get all users default

`GET /rest/api/2/users`

Returns a list of all users, including active users, inactive users and previously deleted users that have an Atlassian account.

Privacy controls are applied to the response based on the users' preferences. This could mean, for example, that the user's email address is hidden. See the [Profile visibility overview](https://developer.atlassian.com/cloud/jira/platform/profile-visibility/) for more details.

**[Permissions](#permissions) required:** *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return.
- **maxResults** (query): The maximum number of items to return (limited to 1000).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the user doesn't have the necessary permission.
- **409**: Returned if the request takes longer than 10 seconds or is interrupted.

---

## Get all users

`GET /rest/api/2/users/search`

Returns a list of all users, including active users, inactive users and previously deleted users that have an Atlassian account.

Privacy controls are applied to the response based on the users' preferences. This could mean, for example, that the user's email address is hidden. See the [Profile visibility overview](https://developer.atlassian.com/cloud/jira/platform/profile-visibility/) for more details.

**[Permissions](#permissions) required:** *Browse users and groups* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return.
- **maxResults** (query): The maximum number of items to return (limited to 1000).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the user doesn't have the necessary permission.
- **409**: Returned if the request takes longer than 10 seconds or is interrupted.

---

