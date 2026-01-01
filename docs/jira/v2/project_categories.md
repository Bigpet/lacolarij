# Project categories

This resource represents project categories. Use it to create, update, and delete project categories as well as obtain a list of all project categories and details of individual categories. For more information on managing project categories, see [Adding, assigning, and deleting project categories](https://confluence.atlassian.com/x/-A5WMg).

## Get all project categories

`GET /rest/api/2/projectCategory`

Returns all project categories.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Create project category

`POST /rest/api/2/projectCategory`

Creates a project category.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ProjectCategory" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if:

 *  `name` is not provided or exceeds 255 characters.
 *  `description` exceeds 1000 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **409**: Returned if the project category name is in use.

---

## Delete project category

`DELETE /rest/api/2/projectCategory/{id}`

Deletes a project category.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): ID of the project category to delete.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the project category is not found.

---

## Get project category by ID

`GET /rest/api/2/projectCategory/{id}`

Returns a project category.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **id** (path): The ID of the project category.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the project category is not found.

---

## Update project category

`PUT /rest/api/2/projectCategory/{id}`

Updates a project category.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): 

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ProjectCategory" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:

 *  `name` has been modified and exceeds 255 characters.
 *  `description` has been modified and exceeds 1000 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the project category is not found.

---

