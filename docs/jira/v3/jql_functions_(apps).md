# JQL functions (apps)

This resource represents JQL function's precomputations. Precomputation is a mapping between custom function call and JQL fragment returned by this function. Use it to get and update precomputations.

## Get precomputations (apps)

`GET /rest/api/3/jql/function/computation`

Returns the list of a function's precomputations along with information about when they were created, updated, and last used. Each precomputation has a `value` \- the JQL fragment to replace the custom function clause with.

**[Permissions](#permissions) required:** This API is only accessible to apps and apps can only inspect their own functions.

The new `read:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **functionKey** (query): The function key in format:

 *  Forge: `ari:cloud:ecosystem::extension/[App ID]/[Environment ID]/static/[Function key from manifest]`
 *  Connect: `[App key]__[Module key]`
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `functionKey` Sorts by the functionKey.
 *  `used` Sorts by the used timestamp.
 *  `created` Sorts by the created timestamp.
 *  `updated` Sorts by the updated timestamp.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request is not authenticated as the app that provided the function.
- **404**: Returned if the function is not found.

---

## Update precomputations (apps)

`POST /rest/api/3/jql/function/computation`

Update the precomputation value of a function created by a Forge/Connect app.

**[Permissions](#permissions) required:** An API for apps to update their own precomputations.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **skipNotFoundPrecomputations** (query): 

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/JqlFunctionPrecomputationUpdateRequestBean"
}
```

### Responses

- **200**: 200 response
- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the request is not authenticated as the app that provided the function.
- **404**: Returned if the function is not found.

---

## Get precomputations by ID (apps)

`POST /rest/api/3/jql/function/computation/search`

Returns function precomputations by IDs, along with information about when they were created, updated, and last used. Each precomputation has a `value` \- the JQL fragment to replace the custom function clause with.

**[Permissions](#permissions) required:** This API is only accessible to apps and apps can only inspect their own functions.

The new `read:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `functionKey` Sorts by the functionKey.
 *  `used` Sorts by the used timestamp.
 *  `created` Sorts by the created timestamp.
 *  `updated` Sorts by the updated timestamp.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/JqlFunctionPrecomputationGetByIdRequest"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request is not authenticated as the app that provided the function.
- **404**: Returned if the function is not found.

---

