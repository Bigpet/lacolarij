# Project types

This resource represents project types. Use it to obtain a list of all project types, a list of project types accessible to the calling user, and details of a project type.

## Get all project types

`GET /rest/api/3/project/type`

Returns all [project types](https://confluence.atlassian.com/x/Var1Nw), whether or not the instance has a valid license for each type.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get licensed project types

`GET /rest/api/3/project/type/accessible`

Returns all [project types](https://confluence.atlassian.com/x/Var1Nw) with a valid license.

### Parameters


### Responses

- **200**: Returned if the request is successful.

---

## Get project type by key

`GET /rest/api/3/project/type/{projectTypeKey}`

Returns a [project type](https://confluence.atlassian.com/x/Var1Nw).

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **projectTypeKey** (path): The key of the project type.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the project type is not found.

---

## Get accessible project type by key

`GET /rest/api/3/project/type/{projectTypeKey}/accessible`

Returns a [project type](https://confluence.atlassian.com/x/Var1Nw) if it is accessible to the user.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **projectTypeKey** (path): The key of the project type.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the project type is not accessible to the user.

---

