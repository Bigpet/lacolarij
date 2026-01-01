# Project features

This resource represents project features. Use it to get the list of features for a project and modify the state of a feature. The project feature endpoint is available only for Jira Software, both for team- and company-managed projects.

## Get project features

`GET /rest/api/3/project/{projectIdOrKey}/features`

Returns the list of features for a project.

### Parameters

- **projectIdOrKey** (path): The ID or (case-sensitive) key of the project.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the project is not found.

---

## Set project feature state

`PUT /rest/api/3/project/{projectIdOrKey}/features/{featureKey}`

Sets the state of a project feature.

### Parameters

- **projectIdOrKey** (path): The ID or (case-sensitive) key of the project.
- **featureKey** (path): The key of the feature.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ProjectFeatureState"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the project or project feature is not found.

---

