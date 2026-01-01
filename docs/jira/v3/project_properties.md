# Project properties

This resource represents [project](#api-group-Projects) properties, which provides for storing custom data against a project. Use it to get, create, and delete project properties as well as get a list of property keys for a project. Project properties are a type of [entity property](https://developer.atlassian.com/cloud/jira/platform/jira-entity-properties/).

## Get project property keys

`GET /rest/api/3/project/{projectIdOrKey}/properties`

Returns all [project property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties) keys for the project.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have permission to view the project.
- **404**: Returned if the project is not found.

---

## Delete project property

`DELETE /rest/api/3/project/{projectIdOrKey}/properties/{propertyKey}`

Deletes the [property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties) from a project.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the property.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **propertyKey** (path): The project property key. Use [Get project property keys](#api-rest-api-3-project-projectIdOrKey-properties-get) to get a list of all project property keys.

### Responses

- **204**: Returned if the project property is deleted.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have permission to administer the project.
- **404**: Returned if the project or property is not found.

---

## Get project property

`GET /rest/api/3/project/{projectIdOrKey}/properties/{propertyKey}`

Returns the value of a [project property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the property.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **propertyKey** (path): The project property key. Use [Get project property keys](#api-rest-api-3-project-projectIdOrKey-properties-get) to get a list of all project property keys.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have permission to view the project.
- **404**: Returned if the project or property is not found.

---

## Set project property

`PUT /rest/api/3/project/{projectIdOrKey}/properties/{propertyKey}`

Sets the value of the [project property](https://developer.atlassian.com/cloud/jira/platform/storing-data-without-a-database/#a-id-jira-entity-properties-a-jira-entity-properties). You can use project properties to store custom data against the project.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project in which the property is created.

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case sensitive).
- **propertyKey** (path): The key of the project property. The maximum length is 255 characters.

### Request Body

**application/json**

```json
{}
```

### Responses

- **200**: Returned if the project property is updated.
- **201**: Returned if the project property is created.
- **400**: Returned if the project key or id is invalid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have permission to administer the project.
- **404**: Returned if the project is not found.

---

