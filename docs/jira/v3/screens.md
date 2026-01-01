# Screens

This resource represents the screens used to record issue details. Use it to:

 *  get details of all screens.
 *  get details of all the fields available for use on screens.
 *  create screens.
 *  delete screens.
 *  update screens.
 *  add a field to the default screen.

## Get screens for a field

`GET /rest/api/3/field/{fieldId}/screens`

Returns a [paginated](#pagination) list of the screens a field is used in.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the field to return screens for.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **expand** (query): Use [expand](#expansion) to include additional information about screens in the response. This parameter accepts `tab` which returns details about the screen tabs the field is used in.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Get screens

`GET /rest/api/3/screens`

Returns a [paginated](#pagination) list of all screens or those specified by one or more screen IDs.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of screen IDs. To include multiple IDs, provide an ampersand-separated list. For example, `id=10000&id=10001`.
- **queryString** (query): String used to perform a case-insensitive partial match with screen name.
- **scope** (query): The scope filter string. To filter by multiple scope, provide an ampersand-separated list. For example, `scope=GLOBAL&scope=PROJECT`.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `id` Sorts by screen ID.
 *  `name` Sorts by screen name.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Create screen

`POST /rest/api/3/screens`

Creates a screen with a default field tab.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ScreenDetails"
}
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.

---

## Add field to default screen

`POST /rest/api/3/screens/addToDefault/{fieldId}`

Adds a field to the default tab of the default screen.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the field.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the field it not found or the field is already present.

---

## Delete screen

`DELETE /rest/api/3/screens/{screenId}`

Deletes a screen. A screen cannot be deleted if it is used in a screen scheme, workflow, or workflow draft.

Only screens used in classic projects can be deleted.

### Parameters

- **screenId** (path): The ID of the screen.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen is not found.

---

## Update screen

`PUT /rest/api/3/screens/{screenId}`

Updates a screen. Only screens used in classic projects can be updated.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/UpdateScreenDetails"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen is not found.

---

## Get available screen fields

`GET /rest/api/3/screens/{screenId}/availableFields`

Returns the fields that can be added to a tab on a screen.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenId** (path): The ID of the screen.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen is not found.

---

