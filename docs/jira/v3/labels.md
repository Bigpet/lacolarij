# Labels

This resource represents available labels. Use it to get available labels for the global label field.

## Get all labels

`GET /rest/api/3/label`

Returns a [paginated](#pagination) list of labels.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.

### Responses

- **200**: Returned if the request is successful.

---

