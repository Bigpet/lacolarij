# UI modifications (apps)

UI modifications is a feature available for **Forge apps only**. It enables Forge apps to control how selected Jira and Jira Service Management fields behave on the following views:

 *  Jira global issue create
 *  Jira issue view
 *  Jira issue transition
 *  Jira Service Management request portal create.

For example: hide specific fields, set them as required, etc.

## Get UI modifications

`GET /rest/api/3/uiModifications`

Gets UI modifications. UI modifications can only be retrieved by Forge apps.

**[Permissions](#permissions) required:** None.

The new `read:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **expand** (query): Use expand to include additional information in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `data` Returns UI modification data.
 *  `contexts` Returns UI modification contexts.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request is not from a Forge app.

---

## Create UI modification

`POST /rest/api/3/uiModifications`

Creates a UI modification. UI modification can only be created by Forge apps.

Each app can define up to 3000 UI modifications. Each UI modification can define up to 1000 contexts. The same context can be assigned to maximum 100 UI modifications.

**Context types:**

 *  **Jira contexts:** For Jira view types, use `projectId` and `issueTypeId`. One field can act as a wildcard. Supported Jira views:
    
     *  `GIC` \- Jira global issue create
     *  `IssueView` \- Jira issue view
     *  `IssueTransition` \- Jira issue transition
 *  **Jira Service Management contexts:** For Jira Service Management view types, use `portalId` and `requestTypeId`. Wildcards are not supported. Supported JSM views:
    
     *  `JSMRequestCreate` \- Jira Service Management request create portal view

**[Permissions](#permissions) required:**

 *  *None* if the UI modification is created without contexts.
 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for one or more projects, if the UI modification is created with contexts.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/CreateUiModificationDetails"
}
```

### Responses

- **201**: Returned if the UI modification is created.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request is not from a Forge app.
- **404**: Returned if a project, issue type, portal, or request type in the context are not found.

---

## Delete UI modification

`DELETE /rest/api/3/uiModifications/{uiModificationId}`

Deletes a UI modification. All the contexts that belong to the UI modification are deleted too. UI modification can only be deleted by Forge apps.

**[Permissions](#permissions) required:** None.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **uiModificationId** (path): The ID of the UI modification.

### Responses

- **204**: Returned if the UI modification is deleted.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request is not from a Forge app.
- **404**: Returned if the UI modification is not found.

---

## Update UI modification

`PUT /rest/api/3/uiModifications/{uiModificationId}`

Updates a UI modification. UI modification can only be updated by Forge apps.

Each UI modification can define up to 1000 contexts. The same context can be assigned to maximum 100 UI modifications.

**Context types:**

 *  **Jira contexts:** For Jira view types, use `projectId` and `issueTypeId`. One field can act as a wildcard. Supported Jira views:
    
     *  `GIC` \- Jira global issue create
     *  `IssueView` \- Jira issue view
     *  `IssueTransition` \- Jira issue transition
 *  **Jira Service Management contexts:** For Jira Service Management view types, use `portalId` and `requestTypeId`. Wildcards are not supported. Supported JSM views:
    
     *  `JSMRequestCreate` \- Jira Service Management request create portal view

**[Permissions](#permissions) required:**

 *  *None* if the UI modification is created without contexts.
 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for one or more projects, if the UI modification is created with contexts.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **uiModificationId** (path): The ID of the UI modification.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/UpdateUiModificationDetails"
}
```

### Responses

- **204**: Returned if the UI modification is updated.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request is not from a Forge app.
- **404**: Returned if the UI modification, a project, issue type, portal, or request type in the context are not found.

---

