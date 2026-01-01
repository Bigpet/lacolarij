# App data policies

This resource represents app access rule data policies.

## Get data policy for the workspace

`GET /rest/api/2/data-policy`

Returns data policy for the workspace.

### Parameters


### Responses

- **200**: Returned if the request is successful
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the client is not authorized to make the request.

---

## Get data policy for projects

`GET /rest/api/2/data-policy/project`

Returns data policies for the projects specified in the request.

### Parameters

- **ids** (query): A list of project identifiers. This parameter accepts a comma-separated list.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid or includes invalid or not-permitted project identifiers.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the client is not authorized to make the request.

---

