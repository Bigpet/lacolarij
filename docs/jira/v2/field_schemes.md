# Field schemes

This resource represents field schemes which are replacing field configuration schemes to control field associations. They are currently in beta and only available to customers who have opted-in to the beta program. For more information see [RFC-103: Jira Field Configuration Overhaul: Admin Experience and API Changes](https://community.developer.atlassian.com/t/rfc-103-jira-field-configuration-overhaul-admin-experience-and-api-changes/94205)

## Get field schemes

`GET /rest/api/2/config/fieldschemes`

REST endpoint for retrieving a paginated list of field association schemes with optional filtering.

This endpoint allows clients to fetch field association schemes with optional filtering by project IDs and text queries. The response includes scheme details with navigation links and filter metadata when applicable.

Filtering Behavior:

 *  When projectId or query parameters are provided, the response includes matchedFilters metadata showing which filters were applied.
 *  When no filters are applied, matchedFilters is omitted from individual scheme objects

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **projectId** (query): (optional) List of project IDs to filter schemes by. If not provided, schemes from all projects are returned.
- **query** (query): (optional) Text filter for scheme name or description matching (case-insensitive). If not provided, no text filtering is applied.
- **startAt** (query): Zero-based index of the first item to return (default: 0)
- **maxResults** (query): Maximum number of items to return per page (default: 50, max: 100)

### Responses

- **200**: Pagianted list of field association schemes
- **400**: Returned if the request parameters are invalid (e.g., negative startAt, maxResults exceeding limit).
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the feature flag is disabled.

---

## Create field scheme

`POST /rest/api/2/config/fieldschemes`

Endpoint for creating a new field association scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreateFieldAssociationSchemeRequest" }
```

### Responses

- **200**: Returned if the creation was successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions
- **404**: Returned if the feature flag is disabled or the scheme ID is not found.

---

## Remove fields associated with field schemes

`DELETE /rest/api/2/config/fieldschemes/fields`

Remove fields associated with field association schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "additionalProperties": {
    "$ref": "#/components/schemas/RemoveFieldAssociationsRequestItem"
  },
  "type": "object"
}
```

### Responses

- **200**: Returned if the field association update was successful.
- **204**: The request completed successfully. No additional content will be sent in the response.
- **207**: Returned if the field association update was partially successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors. If request is well-formed but contains invalid scheme or field IDs, returns failure details.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions

---

## Update fields associated with field schemes

`PUT /rest/api/2/config/fieldschemes/fields`

Update fields associated with field association schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "additionalProperties": {
    "items": {
      "$ref": "#/components/schemas/UpdateFieldAssociationsRequestItem"
    },
    "type": "array"
  },
  "type": "object"
}
```

### Responses

- **200**: Returned if the field association update was successful.
- **204**: The request completed successfully. No additional content will be sent in the response.
- **207**: Returned if the field association update was partially successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors. If request is well-formed but contains invalid scheme or field IDs, returns failure details.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions

---

## Remove field parameters

`DELETE /rest/api/2/config/fieldschemes/fields/parameters`

Remove field association parameters overrides for work types.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "additionalProperties": {
    "items": {
      "$ref": "#/components/schemas/ParameterRemovalDetails"
    },
    "type": "array"
  },
  "type": "object"
}
```

### Responses

- **200**: Returned if the removal was successful.
- **204**: The request completed successfully. No additional content will be sent in the response.
- **207**: Returned if the removal was partially successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors. If request is well-formed but contains invalid scheme or project IDs, returns failure details.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions

---

## Update field parameters

`PUT /rest/api/2/config/fieldschemes/fields/parameters`

Update field association item parameters in field association schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "additionalProperties": {
    "items": {
      "$ref": "#/components/schemas/UpdateFieldSchemeParametersRequest"
    },
    "type": "array"
  },
  "type": "object"
}
```

### Responses

- **200**: Returned if the field parameter update was successful.
- **204**: The request completed successfully. No additional content will be sent in the response.
- **207**: Returned if the field parameter update was partially successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors. If request is well-formed but contains invalid scheme or field IDs, returns failure details.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions

---

## Get projects with field schemes

`GET /rest/api/2/config/fieldschemes/projects`

Get projects with field association schemes. This will be a temporary API but useful when transitioning from the legacy field configuration APIs to the new ones.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The starting index of the returned projects. Base index: 0.
- **maxResults** (query): The maximum number of projects to return per page, maximum allowed value is 100.
- **projectId** (query): List of project ids to filter the results by.

### Responses

- **200**: Returns the list of project with field association schemes.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the feature flag is disabled.

---

## Associate projects to field schemes

`PUT /rest/api/2/config/fieldschemes/projects`

Associate projects to field association schemes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "additionalProperties": {
    "$ref": "#/components/schemas/FieldSchemeToProjectsRequest"
  },
  "type": "object"
}
```

### Responses

- **200**: Returned if the association was successful.
- **204**: The request completed successfully. No additional content will be sent in the response.
- **207**: Returned if the association was partially successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors. If request is well-formed but contains invalid scheme or project IDs, returns failure details.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions

---

## Delete a field scheme

`DELETE /rest/api/2/config/fieldschemes/{id}`

Delete a specified field association scheme

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The ID of the field association scheme to delete.

### Responses

- **200**: Returned if the field association scheme deletion was successful.
- **400**: Returned if the scheme that the user is attempting to delete is a system scheme.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions
- **404**: Return if the provided ID does not match any existing field association scheme
- **409**: Return if the scheme that the user is attempting to delete is still in use.

---

## Get field scheme

`GET /rest/api/2/config/fieldschemes/{id}`

Endpoint for fetching a field association scheme by its ID

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): The scheme id to fetch

### Responses

- **200**: Returned if a field association scheme matches the given scheme ID
- **403**: Returned if the user does not have the required permissions
- **404**: Returned if provided ID does not match any field association schemes

---

## Update field scheme

`PUT /rest/api/2/config/fieldschemes/{id}`

Endpoint for updating an existing field association scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): 

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdateFieldAssociationSchemeRequest" }
```

### Responses

- **200**: Returned if the update was successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions
- **404**: Returned if the feature flag is disabled or the scheme ID is not found.

---

## Search field scheme fields

`GET /rest/api/2/config/fieldschemes/{id}/fields`

Search for fields belonging to a given field association scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The starting index of the returned fields. Base index: 0.
- **maxResults** (query): The maximum number of fields to return per page, maximum allowed value is 100.
- **fieldId** (query): The field IDs to filter by, if empty then all fields belonging to a field association scheme will be returned
- **id** (path): The scheme ID to search for child fields

### Responses

- **200**: Returns the matching fields, at the specified page of the results.
- **400**: Returned if the request parameters are invalid (e.g., negative startAt, maxResults exceeding limit, duplicate fieldIds).
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions.
- **404**: Returned if the feature flag is disabled or the scheme ID is not found.

---

## Get field parameters

`GET /rest/api/2/config/fieldschemes/{id}/fields/{fieldId}/parameters`

Retrieve field association parameters on a field association scheme

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **id** (path): the ID of the field association scheme to retrieve parameters for
- **fieldId** (path): the ID of the field

### Responses

- **200**: Returned if the parameters fetched were successful.
- **400**: Returned if the request is invalid. If request is malformed, returns a collection of errors.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the required permissions

---

## Search field scheme projects

`GET /rest/api/2/config/fieldschemes/{id}/projects`

REST Endpoint for searching for projects belonging to a given field association scheme

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **startAt** (query): The starting index of the returned projects. Base index: 0.
- **maxResults** (query): The maximum number of projects to return per page, maximum allowed value is 100.
- **projectId** (query): The project Ids to filter by, if empty then all projects belonging to a field association scheme will be returned
- **id** (path): The scheme id to search for associated projects

### Responses

- **200**: Returns a paginated list of projects associated with the field association scheme, matching the specified filter criteria.
- **400**: 400 response
- **401**: 401 response
- **403**: 403 response
- **404**: 404 response

---

