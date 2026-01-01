# Classification levels

This resource represents classification levels.

## Get all classification levels

`GET /rest/api/3/classification-levels`

Returns all classification levels.

**[Permissions](#permissions) required:** None.

### Parameters

- **status** (query): Optional set of statuses to filter by.
- **orderBy** (query): Ordering of the results by a given field. If not provided, values will not be sorted.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

