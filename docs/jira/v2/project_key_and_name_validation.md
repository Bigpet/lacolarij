# Project key and name validation

This resource provides validation for project keys and names.

## Validate project key

`GET /rest/api/2/projectvalidate/key`

Validates a project key by confirming the key is a valid string and not in use.

**[Permissions](#permissions) required:** None.

### Parameters

- **key** (query): The project key.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get valid project key

`GET /rest/api/2/projectvalidate/validProjectKey`

Validates a project key and, if the key is invalid or in use, generates a valid random string for the project key.

**[Permissions](#permissions) required:** None.

### Parameters

- **key** (query): The project key.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get valid project name

`GET /rest/api/2/projectvalidate/validProjectName`

Checks that a project name isn't in use. If the name isn't in use, the passed string is returned. If the name is in use, this operation attempts to generate a valid project name based on the one supplied, usually by adding a sequence number. If a valid project name cannot be generated, a 404 response is returned.

**[Permissions](#permissions) required:** None.

### Parameters

- **name** (query): The project name.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if a valid project name cannot be generated.

---

