# Screen tabs

This resource represents the screen tabs used to record issue details. Use it to get, create, update, move, and delete screen tabs.

## Get bulk screen tabs

`GET /rest/api/2/screens/tabs`

Returns the list of tabs for a bulk of screens.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (query): The list of screen IDs. To include multiple screen IDs, provide an ampersand-separated list. For example, `screenId=10000&screenId=10001`.
- **tabId** (query): The list of tab IDs. To include multiple tab IDs, provide an ampersand-separated list. For example, `tabId=10000&tabId=10001`.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResult** (query): The maximum number of items to return per page. The maximum number is 100,

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the screen ID or the tab ID is empty.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Get all screen tabs

`GET /rest/api/2/screens/{screenId}/tabs`

Returns the list of tabs for a screen.

**[Permissions](#permissions) required:**

 *  *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).
 *  *Administer projects* [project permission](https://confluence.atlassian.com/x/yodKLg) when the project key is specified, providing that the screen is associated with the project through a Screen Scheme and Issue Type Screen Scheme.

### Parameters

- **screenId** (path): The ID of the screen.
- **projectKey** (query): The key of the project.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the screen ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen is not found.

---

## Create screen tab

`POST /rest/api/2/screens/{screenId}/tabs`

Creates a tab for a screen.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ScreenableTab" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen is not found.

---

## Delete screen tab

`DELETE /rest/api/2/screens/{screenId}/tabs/{tabId}`

Deletes a screen tab.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen or screen tab is not found.

---

## Update screen tab

`PUT /rest/api/2/screens/{screenId}/tabs/{tabId}`

Updates the name of a screen tab.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ScreenableTab" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen or screen tab is not found.

---

## Move screen tab

`POST /rest/api/2/screens/{screenId}/tabs/{tabId}/move/{pos}`

Moves a screen tab.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.
- **tabId** (path): The ID of the screen tab.
- **pos** (path): The position of tab. The base index is 0.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen or screen tab is not found or the position is invalid.

---

