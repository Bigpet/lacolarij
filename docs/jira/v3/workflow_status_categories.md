# Workflow status categories

This resource represents status categories. Use it to obtain a list of all status categories and the details of a category. Status categories provided a mechanism for categorizing [statuses](#api-group-Workflow-statuses).

## Get all status categories

`GET /rest/api/3/statuscategory`

Returns a list of all status categories.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get status category

`GET /rest/api/3/statuscategory/{idOrKey}`

Returns a status category. Status categories provided a mechanism for categorizing [statuses](#api-rest-api-3-status-idOrName-get).

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **idOrKey** (path): The ID or key of the status category.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the status category is not found.

---

