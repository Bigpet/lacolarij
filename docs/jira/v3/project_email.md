# Project email

This resource represents the email address used to send a project's notifications. Use it to get and set the [project's sender email address](https://confluence.atlassian.com/x/dolKLg).

## Get project's sender email

`GET /rest/api/3/project/{projectId}/email`

Returns the [project's sender email address](https://confluence.atlassian.com/x/dolKLg).

**[Permissions](#permissions) required:** *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project.

### Parameters

- **projectId** (path): The project ID.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to read project.
- **404**: Returned if the project or project's sender email address is not found.

---

## Set project's sender email

`PUT /rest/api/3/project/{projectId}/email`

Sets the [project's sender email address](https://confluence.atlassian.com/x/dolKLg).

If `emailAddress` is an empty string, the default email address is restored.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) or *Administer Projects* [project permission.](https://confluence.atlassian.com/x/yodKLg)

### Parameters

- **projectId** (path): The project ID.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ProjectEmailAddress"
}
```

### Responses

- **204**: Returned if the project's sender email address is successfully set.
- **400**: Returned if the request is not valid, if the email address is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to administer the project.
- **404**: Returned if the project is not found.

---

