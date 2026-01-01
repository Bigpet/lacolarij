# Dashboards

This resource represents dashboards. Use it to obtain the details of dashboards as well as get, create, update, or remove item properties and gadgets from dashboards.

## Get all dashboards

`GET /rest/api/2/dashboard`

Returns a list of dashboards owned by or shared with the user. The list may be filtered to include only favorite or owned dashboards.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **filter** (query): The filter applied to the list of dashboards. Valid values are:

 *  `favourite` Returns dashboards the user has marked as favorite.
 *  `my` Returns dashboards owned by the user.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Create dashboard

`POST /rest/api/2/dashboard`

Creates a dashboard.

**[Permissions](#permissions) required:** None.

### Parameters

- **extendAdminPermissions** (query): Whether admin level permissions are used. It should only be true if the user has *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg)

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DashboardDetails" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Bulk edit dashboards

`PUT /rest/api/2/dashboard/bulk/edit`

Bulk edit dashboards. Maximum number of dashboards to be edited at the same time is 100.

**[Permissions](#permissions) required:** None

The dashboards to be updated must be owned by the user, or the user must be an administrator.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/BulkEditShareableEntityRequest" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get available gadgets

`GET /rest/api/2/dashboard/gadgets`

Gets a list of all available gadgets that can be added to all dashboards.

**[Permissions](#permissions) required:** None.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **400**: 400 response
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Search for dashboards

`GET /rest/api/2/dashboard/search`

Returns a [paginated](#pagination) list of dashboards. This operation is similar to [Get dashboards](#api-rest-api-2-dashboard-get) except that the results can be refined to include dashboards that have specific attributes. For example, dashboards with a particular name. When multiple attributes are specified only filters matching all attributes are returned.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** The following dashboards that match the query parameters are returned:

 *  Dashboards owned by the user. Not returned for anonymous users.
 *  Dashboards shared with a group that the user is a member of. Not returned for anonymous users.
 *  Dashboards shared with a private project that the user can browse. Not returned for anonymous users.
 *  Dashboards shared with a public project.
 *  Dashboards shared with the public.

### Parameters

- **dashboardName** (query): String used to perform a case-insensitive partial match with `name`.
- **accountId** (query): User account ID used to return dashboards with the matching `owner.accountId`. This parameter cannot be used with the `owner` parameter.
- **owner** (query): This parameter is deprecated because of privacy changes. Use `accountId` instead. See the [migration guide](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details. User name used to return dashboards with the matching `owner.name`. This parameter cannot be used with the `accountId` parameter.
- **groupname** (query): As a group's name can change, use of `groupId` is recommended. Group name used to return dashboards that are shared with a group that matches `sharePermissions.group.name`. This parameter cannot be used with the `groupId` parameter.
- **groupId** (query): Group ID used to return dashboards that are shared with a group that matches `sharePermissions.group.groupId`. This parameter cannot be used with the `groupname` parameter.
- **projectId** (query): Project ID used to returns dashboards that are shared with a project that matches `sharePermissions.project.id`.
- **orderBy** (query): [Order](#ordering) the results by a field:

 *  `description` Sorts by dashboard description. Note that this sort works independently of whether the expand to display the description field is in use.
 *  `favourite_count` Sorts by dashboard popularity.
 *  `id` Sorts by dashboard ID.
 *  `is_favourite` Sorts by whether the dashboard is marked as a favorite.
 *  `name` Sorts by dashboard name.
 *  `owner` Sorts by dashboard owner name.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **status** (query): The status to filter by. It may be active, archived or deleted.
- **expand** (query): Use [expand](#expansion) to include additional information about dashboard in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `description` Returns the description of the dashboard.
 *  `owner` Returns the owner of the dashboard.
 *  `viewUrl` Returns the URL that is used to view the dashboard.
 *  `favourite` Returns `isFavourite`, an indicator of whether the user has set the dashboard as a favorite.
 *  `favouritedCount` Returns `popularity`, a count of how many users have set this dashboard as a favorite.
 *  `sharePermissions` Returns details of the share permissions defined for the dashboard.
 *  `editPermissions` Returns details of the edit permissions defined for the dashboard.
 *  `isWritable` Returns whether the current user has permission to edit the dashboard.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:

 *  `orderBy` is invalid.
 *  `expand` includes an invalid value.
 *  `accountId` and `owner` are provided.
 *  `groupname` and `groupId` are provided.
- **401**: 401 response

---

## Get gadgets

`GET /rest/api/2/dashboard/{dashboardId}/gadget`

Returns a list of dashboard gadgets on a dashboard.

This operation returns:

 *  Gadgets from a list of IDs, when `id` is set.
 *  Gadgets with a module key, when `moduleKey` is set.
 *  Gadgets from a list of URIs, when `uri` is set.
 *  All gadgets, when no other parameters are set.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **moduleKey** (query): The list of gadgets module keys. To include multiple module keys, separate module keys with ampersand: `moduleKey=key:one&moduleKey=key:two`.
- **uri** (query): The list of gadgets URIs. To include multiple URIs, separate URIs with ampersand: `uri=/rest/example/uri/1&uri=/rest/example/uri/2`.
- **gadgetId** (query): The list of gadgets IDs. To include multiple IDs, separate IDs with ampersand: `gadgetId=10000&gadgetId=10001`.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the dashboard is not found.

---

## Add gadget to dashboard

`POST /rest/api/2/dashboard/{dashboardId}/gadget`

Adds a gadget to a dashboard.

**[Permissions](#permissions) required:** None.

### Parameters

- **dashboardId** (path): The ID of the dashboard.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DashboardGadgetSettings" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the dashboard is not found.

---

## Remove gadget from dashboard

`DELETE /rest/api/2/dashboard/{dashboardId}/gadget/{gadgetId}`

Removes a dashboard gadget from a dashboard.

When a gadget is removed from a dashboard, other gadgets in the same column are moved up to fill the emptied position.

**[Permissions](#permissions) required:** None.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **gadgetId** (path): The ID of the gadget.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the gadget or the dashboard is not found.

---

## Update gadget on dashboard

`PUT /rest/api/2/dashboard/{dashboardId}/gadget/{gadgetId}`

Changes the title, position, and color of the gadget on a dashboard.

**[Permissions](#permissions) required:** None.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **gadgetId** (path): The ID of the gadget.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DashboardGadgetUpdateRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the gadget or the dashboard is not found.

---

## Get dashboard item property keys

`GET /rest/api/2/dashboard/{dashboardId}/items/{itemId}/properties`

Returns the keys of all properties for a dashboard item.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** The user must have read permission of the dashboard or have the dashboard shared with them.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **itemId** (path): The ID of the dashboard item.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the dashboard or dashboard item is not found, or the dashboard is not owned by or shared with the user.

---

## Delete dashboard item property

`DELETE /rest/api/2/dashboard/{dashboardId}/items/{itemId}/properties/{propertyKey}`

Deletes a dashboard item property.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** The user must have edit permission of the dashboard.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **itemId** (path): The ID of the dashboard item.
- **propertyKey** (path): The key of the dashboard item property.

### Responses

- **204**: Returned if the dashboard item property is deleted.
- **400**: Returned if the dashboard or dashboard item ID is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user is not the owner of the dashboard.
- **404**: Returned if the dashboard item is not found or the dashboard is not shared with the user.

---

## Get dashboard item property

`GET /rest/api/2/dashboard/{dashboardId}/items/{itemId}/properties/{propertyKey}`

Returns the key and value of a dashboard item property.

A dashboard item enables an app to add user-specific information to a user dashboard. Dashboard items are exposed to users as gadgets that users can add to their dashboards. For more information on how users do this, see [Adding and customizing gadgets](https://confluence.atlassian.com/x/7AeiLQ).

When an app creates a dashboard item it registers a callback to receive the dashboard item ID. The callback fires whenever the item is rendered or, where the item is configurable, the user edits the item. The app then uses this resource to store the item's content or configuration details. For more information on working with dashboard items, see [ Building a dashboard item for a JIRA Connect add-on](https://developer.atlassian.com/server/jira/platform/guide-building-a-dashboard-item-for-a-jira-connect-add-on-33746254/) and the [Dashboard Item](https://developer.atlassian.com/cloud/jira/platform/modules/dashboard-item/) documentation.

There is no resource to set or get dashboard items.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** The user must have read permission of the dashboard or have the dashboard shared with them.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **itemId** (path): The ID of the dashboard item.
- **propertyKey** (path): The key of the dashboard item property.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the dashboard, the dashboard item, or dashboard item property is not found, or the dashboard is not owned by or shared with the user.

---

## Set dashboard item property

`PUT /rest/api/2/dashboard/{dashboardId}/items/{itemId}/properties/{propertyKey}`

Sets the value of a dashboard item property. Use this resource in apps to store custom data against a dashboard item.

A dashboard item enables an app to add user-specific information to a user dashboard. Dashboard items are exposed to users as gadgets that users can add to their dashboards. For more information on how users do this, see [Adding and customizing gadgets](https://confluence.atlassian.com/x/7AeiLQ).

When an app creates a dashboard item it registers a callback to receive the dashboard item ID. The callback fires whenever the item is rendered or, where the item is configurable, the user edits the item. The app then uses this resource to store the item's content or configuration details. For more information on working with dashboard items, see [ Building a dashboard item for a JIRA Connect add-on](https://developer.atlassian.com/server/jira/platform/guide-building-a-dashboard-item-for-a-jira-connect-add-on-33746254/) and the [Dashboard Item](https://developer.atlassian.com/cloud/jira/platform/modules/dashboard-item/) documentation.

There is no resource to set or get dashboard items.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** The user must have edit permisson of the dashboard.

### Parameters

- **dashboardId** (path): The ID of the dashboard.
- **itemId** (path): The ID of the dashboard item.
- **propertyKey** (path): The key of the dashboard item property. The maximum length is 255 characters. For dashboard items with a spec URI and no complete module key, if the provided propertyKey is equal to "config", the request body's JSON must be an object with all keys and values as strings.

### Request Body

**application/json**

```json

```

### Responses

- **200**: Returned if the dashboard item property is updated.
- **201**: Returned if the dashboard item property is created.
- **400**: Returned if:

 *  Request is invalid
 *  Or if all of these conditions are met in the request:
    
     *  The dashboard item has a spec URI and no complete module key
     *  The value of propertyKey is equal to "config"
     *  The request body contains a JSON object whose keys and values are not strings.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user is not the owner of the dashboard.
- **404**: Returned if the dashboard item is not found or the dashboard is not shared with the user.

---

## Delete dashboard

`DELETE /rest/api/2/dashboard/{id}`

Deletes a dashboard.

**[Permissions](#permissions) required:** None

The dashboard to be deleted must be owned by the user.

### Parameters

- **id** (path): The ID of the dashboard.

### Responses

- **204**: Returned if the dashboard is deleted.
- **400**: 400 response
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get dashboard

`GET /rest/api/2/dashboard/{id}`

Returns a dashboard.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

However, to get a dashboard, the dashboard must be shared with the user or the user must own it. Note, users with the *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) are considered owners of the System dashboard. The System dashboard is considered to be shared with all other users.

### Parameters

- **id** (path): The ID of the dashboard.

### Responses

- **200**: Returned if the request is successful.
- **400**: 400 response
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the dashboard is not found or the dashboard is not owned by or shared with the user.

---

## Update dashboard

`PUT /rest/api/2/dashboard/{id}`

Updates a dashboard, replacing all the dashboard details with those provided.

**[Permissions](#permissions) required:** None

The dashboard to be updated must be owned by the user.

### Parameters

- **id** (path): The ID of the dashboard to update.
- **extendAdminPermissions** (query): Whether admin level permissions are used. It should only be true if the user has *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg)

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DashboardDetails" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the dashboard is not found or the dashboard is not owned by the user.

---

## Copy dashboard

`POST /rest/api/2/dashboard/{id}/copy`

Copies a dashboard. Any values provided in the `dashboard` parameter replace those in the copied dashboard.

**[Permissions](#permissions) required:** None

The dashboard to be copied must be owned by or shared with the user.

### Parameters

- **id** (path): 
- **extendAdminPermissions** (query): Whether admin level permissions are used. It should only be true if the user has *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg)

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DashboardDetails" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the dashboard is not found or the dashboard is not owned by or shared with the user.

---

