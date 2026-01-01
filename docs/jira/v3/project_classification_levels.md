# Project classification levels

This resource represents classification levels used in a project. Use it to view and manage classification levels in your projects.

## Remove the default data classification level from a project

`DELETE /rest/api/3/project/{projectIdOrKey}/classification-level/default`

Remove the default data classification level for a project.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.
 *  *Administer jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case-sensitive).

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the user does not have the necessary permission.
- **404**: Returned if the project is not found.

---

## Get the default data classification level of a project

`GET /rest/api/3/project/{projectIdOrKey}/classification-level/default`

Returns the default data classification for a project.

**[Permissions](#permissions) required:**

 *  *Browse Projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.
 *  *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.
 *  *Administer jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case-sensitive).

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the user does not have the necessary permission.
- **404**: Returned if the project is not found.

---

## Update the default data classification level of a project

`PUT /rest/api/3/project/{projectIdOrKey}/classification-level/default`

Updates the default data classification level for a project.

**[Permissions](#permissions) required:**

 *  *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.
 *  *Administer jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectIdOrKey** (path): The project ID or project key (case-sensitive).

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/UpdateDefaultProjectClassificationBean"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the user does not have the necessary permission.
- **404**: Returned if the project is not found.

---

