# Screen schemes

This resource represents screen schemes in classic projects. Use it to get, create, update, and delete screen schemes.

## Get screen schemes

`GET /rest/api/2/screenscheme`

Returns a [paginated](#pagination) list of screen schemes.

Only screen schemes used in classic projects are returned.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of screen scheme IDs. To include multiple IDs, provide an ampersand-separated list. For example, `id=10000&id=10001`.
- **expand** (query): Use [expand](#expansion) include additional information in the response. This parameter accepts `issueTypeScreenSchemes` that, for each screen schemes, returns information about the issue type screen scheme the screen scheme is assigned to.
- **queryString** (query): String used to perform a case-insensitive partial match with screen scheme name.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `id` Sorts by screen scheme ID.
 *  `name` Sorts by screen scheme name.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Create screen scheme

`POST /rest/api/2/screenscheme`

Creates a screen scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ScreenSchemeDetails" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if a screen used as one of the screen types in the screen scheme is not found.

---

## Delete screen scheme

`DELETE /rest/api/2/screenscheme/{screenSchemeId}`

Deletes a screen scheme. A screen scheme cannot be deleted if it is used in an issue type screen scheme.

Only screens schemes used in classic projects can be deleted.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenSchemeId** (path): The ID of the screen scheme.

### Responses

- **204**: Returned if the screen scheme is deleted.
- **400**: Returned if the screen scheme is used in an issue type screen scheme.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the screen scheme is not found.

---

## Update screen scheme

`PUT /rest/api/2/screenscheme/{screenSchemeId}`

Updates a screen scheme. Only screen schemes used in classic projects can be updated.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **screenSchemeId** (path): The ID of the screen scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateScreenSchemeDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the screen scheme or a screen used as one of the screen types is not found.

---

