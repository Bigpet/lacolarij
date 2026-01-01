# Issue link types

This resource represents [issue link](#api-group-Issue-links) types. Use it to get, create, update, and delete link issue types as well as get lists of all link issue types.

To use it, the site must have [issue linking](https://confluence.atlassian.com/x/yoXKM) enabled.

## Get issue link types

`GET /rest/api/2/issueLinkType`

Returns a list of all issue link types.

To use this operation, the site must have [issue linking](https://confluence.atlassian.com/x/yoXKM) enabled.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for a project in the site.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if issue linking is disabled.

---

## Create issue link type

`POST /rest/api/2/issueLinkType`

Creates an issue link type. Use this operation to create descriptions of the reasons why issues are linked. The issue link type consists of a name and descriptions for a link's inward and outward relationships.

To use this operation, the site must have [issue linking](https://confluence.atlassian.com/x/yoXKM) enabled.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueLinkType" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  issue linking is disabled.
 *  the issue link type name is in use.
 *  the user does not have the required permissions.

---

## Delete issue link type

`DELETE /rest/api/2/issueLinkType/{issueLinkTypeId}`

Deletes an issue link type.

To use this operation, the site must have [issue linking](https://confluence.atlassian.com/x/yoXKM) enabled.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueLinkTypeId** (path): The ID of the issue link type.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the issue link type ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  issue linking is disabled.
 *  the issue link type is not found.
 *  the user does not have the required permissions.

---

## Get issue link type

`GET /rest/api/2/issueLinkType/{issueLinkTypeId}`

Returns an issue link type.

To use this operation, the site must have [issue linking](https://confluence.atlassian.com/x/yoXKM) enabled.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for a project in the site.

### Parameters

- **issueLinkTypeId** (path): The ID of the issue link type.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the issue link type ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  issue linking is disabled.
 *  the issue link type is not found.
 *  the user does not have the required permissions.

---

## Update issue link type

`PUT /rest/api/2/issueLinkType/{issueLinkTypeId}`

Updates an issue link type.

To use this operation, the site must have [issue linking](https://confluence.atlassian.com/x/yoXKM) enabled.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueLinkTypeId** (path): The ID of the issue link type.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueLinkType" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the issue link type ID or the request body are invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  issue linking is disabled.
 *  the issue link type is not found.
 *  the user does not have the required permissions.

---

