# Project templates

This resource represents project templates. Use it to create a new project from a custom template.

## Create custom project

`POST /rest/api/2/project-template`

Creates a project based on a custom template provided in the request.

The request body should contain the project details and the capabilities that comprise the project:

 *  `details` \- represents the project details settings
 *  `template` \- represents a list of capabilities responsible for creating specific parts of a project

A capability is defined as a unit of configuration for the project you want to create.

This operation is:

 *  [asynchronous](#async). Follow the `Location` link in the response header to determine the status of the task and use [Get task](#api-rest-api-2-task-taskId-get) to obtain subsequent updates.

***Note: This API is only supported for Jira Enterprise edition.***

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ProjectCustomTemplateCreateRequestDTO" }
```

### Responses

- **303**: The project creation task has been queued for execution

---

## Edit a custom project template

`PUT /rest/api/2/project-template/edit-template`

Edit custom template

This API endpoint allows you to edit an existing customised template.

***Note: Custom Templates are only supported for Jira Enterprise edition.***

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/EditTemplateRequest" }
```

### Responses

- **200**: 200 response

---

## Gets a custom project template

`GET /rest/api/2/project-template/live-template`

Get custom template

This API endpoint allows you to get a live custom project template details by either templateKey or projectId

***Note: Custom Templates are only supported for Jira Enterprise edition.***

### Parameters

- **projectId** (query): optional - The \{@link String\} containing the project key linked to the custom template to retrieve
- **templateKey** (query): optional - The \{@link String\} containing the key of the custom template to retrieve

### Responses

- **200**: 200 response

---

## Deletes a custom project template

`DELETE /rest/api/2/project-template/remove-template`

Remove custom template

This API endpoint allows you to remove a specified customised template

***Note: Custom Templates are only supported for Jira Enterprise edition.***

### Parameters

- **templateKey** (query): The \{@link String\} containing the key of the custom template to remove

### Responses

- **200**: 200 response

---

## Save a custom project template

`POST /rest/api/2/project-template/save-template`

Save custom template

This API endpoint allows you to save a customised template

***Note: Custom Templates are only supported for Jira Enterprise edition.***

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SaveTemplateRequest" }
```

### Responses

- **200**: 200 response

---

