# Issue type properties

This resource represents [issue type](#api-group-Issue-types) properties, which provides for storing custom data against an issue type. Use it to get, create, and delete issue type properties as well as obtain the keys of all properties on a issues type. Issue type properties are a type of [entity property](https://developer.atlassian.com/cloud/jira/platform/jira-entity-properties/).

## Get issue type property keys

`GET /rest/api/2/issuetype/{issueTypeId}/properties`

Returns all the [issue type property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties) keys of the issue type.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) to get the property keys of any issue type.
 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) to get the property keys of any issue types associated with the projects the user has permission to browse.

### Parameters

- **issueTypeId** (path): The ID of the issue type.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the issue type ID is invalid.
- **404**: Returned if:

 *  the issue type is not found.
 *  the user does not have the required permissions.

---

## Delete issue type property

`DELETE /rest/api/2/issuetype/{issueTypeId}/properties/{propertyKey}`

Deletes the [issue type property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeId** (path): The ID of the issue type.
- **propertyKey** (path): The key of the property. Use [Get issue type property keys](#api-rest-api-2-issuetype-issueTypeId-properties-get) to get a list of all issue type property keys.

### Responses

- **204**: Returned if the issue type property is deleted.
- **400**: Returned if the issue type ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the issue type or property is not found.

---

## Get issue type property

`GET /rest/api/2/issuetype/{issueTypeId}/properties/{propertyKey}`

Returns the key and value of the [issue type property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) to get the details of any issue type.
 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) to get the details of any issue types associated with the projects the user has permission to browse.

### Parameters

- **issueTypeId** (path): The ID of the issue type.
- **propertyKey** (path): The key of the property. Use [Get issue type property keys](#api-rest-api-2-issuetype-issueTypeId-properties-get) to get a list of all issue type property keys.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the issue type ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue type or property is not found or the user does not have the required permissions.

---

## Set issue type property

`PUT /rest/api/2/issuetype/{issueTypeId}/properties/{propertyKey}`

Creates or updates the value of the [issue type property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties). Use this resource to store and update data against an issue type.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **issueTypeId** (path): The ID of the issue type.
- **propertyKey** (path): The key of the issue type property. The maximum length is 255 characters.

### Request Body

**application/json**

```json

```

### Responses

- **200**: Returned if the issue type property is updated.
- **201**: Returned if the issue type property is created.
- **400**: Returned if:

 *  the issue type ID is invalid.
 *  a property value is not provided.
 *  the property value JSON content is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to modify the issue type.
- **404**: Returned if:

 *  the issue type is not found.
 *  the user does not have the permission view the issue type.

---

