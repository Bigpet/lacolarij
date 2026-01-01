# Screen tab fields

This resource represents the screen tab fields used to record issue details. Use it to get, add, move, and remove fields from screen tabs.

## Get all screen tab fields

`GET /rest/api/2/screens/{screenId}/tabs/{tabId}/fields`

Returns all fields for a screen tab.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).
 *  *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) when the project key is specified, providing that the screen is associated with the project through a Screen Scheme and Issue Type Screen Scheme.

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.
- **projectKey** (query): The key of the project.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen or screen tab is not found.

---

## Add screen tab field

`POST /rest/api/2/screens/{screenId}/tabs/{tabId}/fields`

Adds a field to a screen tab.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/AddFieldBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen, screen tab, or field is not found.

---

## Remove screen tab field

`DELETE /rest/api/2/screens/{screenId}/tabs/{tabId}/fields/{id}`

Removes a field from a screen tab.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.
- **id** (path): The ID of the field.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen, screen tab, or field is not found.

---

## Move screen tab field

`POST /rest/api/2/screens/{screenId}/tabs/{tabId}/fields/{id}/move`

Moves a screen tab field.

If `after` and `position` are provided in the request, `position` is ignored.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.
- **id** (path): The ID of the field.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/MoveFieldBean" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen, screen tab, or field is not found or the field can't be moved to the requested position.

---

