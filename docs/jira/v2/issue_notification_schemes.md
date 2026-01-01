# Issue notification schemes

This resource represents notification schemes, lists of events and the recipients who will receive notifications for those events. Use it to get details of a notification scheme and a list of notification schemes.

### About notification schemes ###

A notification scheme is a list of events and recipients who will receive notifications for those events. The list is contained within the `notificationSchemeEvents` object and contains pairs of `events` and `notifications`:

 *  `event` Identifies the type of event. The events can be [Jira system events](https://support.atlassian.com/jira-cloud-administration/docs/configure-notification-schemes/) (see the *Events* section) or [custom events](https://support.atlassian.com/jira-cloud-administration/docs/add-a-custom-event/).
 *  `notifications` Identifies the [recipients](https://confluence.atlassian.com/x/8YdKLg#Creatinganotificationscheme-recipientsRecipients) of notifications for each event. Recipients can be any of the following types:
    
     *  `CurrentAssignee`
     *  `Reporter`
     *  `CurrentUser`
     *  `ProjectLead`
     *  `ComponentLead`
     *  `User` (the `parameter` is the user key)
     *  `Group` (the `parameter` is the group name)
     *  `ProjectRole` (the `parameter` is the project role ID)
     *  `EmailAddress` *(deprecated)*
     *  `AllWatchers`
     *  `UserCustomField` (the `parameter` is the ID of the custom field)
     *  `GroupCustomField`(the `parameter` is the ID of the custom field)

## Get notification schemes paginated

`GET /rest/api/2/notificationscheme`

Returns a [paginated](#pagination) list of [notification schemes](https://confluence.atlassian.com/x/8YdKLg) ordered by the display name.

*Note that you should allow for events without recipients to appear in responses.*

**[Permissions](#permissions) required:** Permission to access Jira, however, the user must have permission to administer at least one project associated with a notification scheme for it to be returned.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **id** (query): The list of notification schemes IDs to be filtered by
- **projectId** (query): The list of projects IDs to be filtered by
- **onlyDefault** (query): When set to true, returns only the default notification scheme. If you provide project IDs not associated with the default, returns an empty page. The default value is false.
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `all` Returns all expandable information
 *  `field` Returns information about any custom fields assigned to receive an event
 *  `group` Returns information about any groups assigned to receive an event
 *  `notificationSchemeEvents` Returns a list of event associations. This list is returned for all expandable information
 *  `projectRole` Returns information about any project roles assigned to receive an event
 *  `user` Returns information about any users assigned to receive an event

### Responses

- **200**: Returned if the request is successful. Only returns notification schemes that the user has permission to access. An empty list is returned if the user lacks permission to access all notification schemes.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Create notification scheme

`POST /rest/api/2/notificationscheme`

Creates a notification scheme with notifications. You can create up to 1000 notifications per request.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreateNotificationSchemeDetails" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.

---

## Get projects using notification schemes paginated

`GET /rest/api/2/notificationscheme/project`

Returns a [paginated](#pagination) mapping of project that have notification scheme assigned. You can provide either one or multiple notification scheme IDs or project IDs to filter by. If you don't provide any, this will return a list of all mappings. Note that only company-managed (classic) projects are supported. This is because team-managed projects don't have a concept of a default notification scheme. The mappings are ordered by projectId.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **notificationSchemeId** (query): The list of notifications scheme IDs to be filtered out
- **projectId** (query): The list of project IDs to be filtered out

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if search criteria are invalid, strings vs numbers for projectId, notificationSchemeId, startAt and maxResult
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get notification scheme

`GET /rest/api/2/notificationscheme/{id}`

Returns a [notification scheme](https://confluence.atlassian.com/x/8YdKLg), including the list of events and the recipients who will receive notifications for those events.

**[Permissions](#permissions) required:** Permission to access Jira, however, the user must have permission to administer at least one project associated with the notification scheme.

### Parameters

- **id** (path): The ID of the notification scheme. Use [Get notification schemes paginated](#api-rest-api-2-notificationscheme-get) to get a list of notification scheme IDs.
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `all` Returns all expandable information
 *  `field` Returns information about any custom fields assigned to receive an event
 *  `group` Returns information about any groups assigned to receive an event
 *  `notificationSchemeEvents` Returns a list of event associations. This list is returned for all expandable information
 *  `projectRole` Returns information about any project roles assigned to receive an event
 *  `user` Returns information about any users assigned to receive an event

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the notification scheme is not found or the user does not have permission to view it.

---

## Update notification scheme

`PUT /rest/api/2/notificationscheme/{id}`

Updates a notification scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the notification scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateNotificationSchemeDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the notification scheme isn't found.

---

## Add notifications to notification scheme

`PUT /rest/api/2/notificationscheme/{id}/notification`

Adds notifications to a notification scheme. You can add up to 1000 notifications per request.

*Deprecated: The notification type `EmailAddress` is no longer supported in Cloud. Refer to the [changelog](https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-1031) for more details.*

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the notification scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/AddNotificationsDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the notification scheme isn't found.

---

## Delete notification scheme

`DELETE /rest/api/2/notificationscheme/{notificationSchemeId}`

Deletes a notification scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **notificationSchemeId** (path): The ID of the notification scheme.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if the notification scheme isn't found.

---

## Remove notification from notification scheme

`DELETE /rest/api/2/notificationscheme/{notificationSchemeId}/notification/{notificationId}`

Removes a notification from a notification scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **notificationSchemeId** (path): The ID of the notification scheme.
- **notificationId** (path): The ID of the notification.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permission.
- **404**: Returned if either the notification scheme or notification isn't found.

---

