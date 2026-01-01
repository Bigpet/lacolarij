# Priority schemes

This resource represents issue priority schemes. Use it to get priority schemes and related information, and to create, update and delete priority schemes.

## Get priority schemes

`GET /rest/api/2/priorityscheme`

Returns a [paginated](#pagination) list of priority schemes.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **priorityId** (query): A set of priority IDs to filter by. To include multiple IDs, provide an ampersand-separated list. For example, `priorityId=10000&priorityId=10001`.
- **schemeId** (query): A set of priority scheme IDs. To include multiple IDs, provide an ampersand-separated list. For example, `schemeId=10000&schemeId=10001`.
- **schemeName** (query): The name of scheme to search for.
- **onlyDefault** (query): Whether only the default priority is returned.
- **orderBy** (query): The ordering to return the priority schemes by.
- **expand** (query): A comma separated list of additional information to return. "priorities" will return priorities associated with the priority scheme. "projects" will return projects associated with the priority scheme. `expand=priorities,projects`.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Create priority scheme

`POST /rest/api/2/priorityscheme`

Creates a new priority scheme.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreatePrioritySchemeDetails" }
```

### Responses

- **201**: Returned if the request is completed.
- **202**: Returned if the request is accepted.
- **400**: Returned if the request isn't valid.

**Mappings Validation Errors**

 *  ``The priorities with IDs [ID 1, ID 2, ...] require mapping. Please provide mappings in the 'in' mappings object, where these priorities are the keys with corresponding values.`` The listed priority ID(s) have not been provided as keys for ``in`` mappings but are required, add them to the mappings object.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user doesn't have the necessary permissions.
- **409**: Returned if an action with this priority scheme is still in progress.

---

## Suggested priorities for mappings

`POST /rest/api/2/priorityscheme/mappings`

Returns a [paginated](#pagination) list of priorities that would require mapping, given a change in priorities or projects associated with a priority scheme.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SuggestedMappingsRequestBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get available priorities by priority scheme

`GET /rest/api/2/priorityscheme/priorities/available`

Returns a [paginated](#pagination) list of priorities available for adding to a priority scheme.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **query** (query): The string to query priorities on by name.
- **schemeId** (query): The priority scheme ID.
- **exclude** (query): A list of priority IDs to exclude from the results.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Delete priority scheme

`DELETE /rest/api/2/priorityscheme/{schemeId}`

Deletes a priority scheme.

This operation is only available for priority schemes without any associated projects. Any associated projects must be removed from the priority scheme before this operation can be performed.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The priority scheme ID.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permissions.

---

## Update priority scheme

`PUT /rest/api/2/priorityscheme/{schemeId}`

Updates a priority scheme. This includes its details, the lists of priorities and projects in it

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **schemeId** (path): The ID of the priority scheme.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/UpdatePrioritySchemeRequestBean" }
```

### Responses

- **202**: Returned if the request is accepted.
- **400**: Returned if the request isn't valid.

**Mappings Validation Errors**

 *  ``The changes to priority schemes require mapping of priorities. Please provide a value for the 'in' mappings object.`` Priorities are being removed and/or projects are being added to the scheme, but ``in`` mappings are not provided.
 *  ``The changes to priority schemes require mapping of priorities. Please provide a value for the 'out' mappings object.`` Projects are being removed from the scheme, but ``out`` mappings are not provided.
 *  ``The priorities with IDs [ID 1, ID 2, ...] provided as keys for the 'in' mappings object do not exist. Please provide existing priority IDs.`` The listed priority ID(s) have been provided as keys for ``in`` mappings but do not exist. Please confirm the correct priority ID(s) have been provided, they should be priorities that exist on the Jira site which are used by projects being added to the current scheme, but are not in use by the current scheme.
 *  ``The priorities with IDs [ID 1, ID 2, ...] provided as values for the 'in' mappings object do not exist. Please provide existing priority IDs used by the current priority scheme.`` The listed priority ID(s) have been provided as values for ``in`` mappings but do not exist. Please confirm the correct priority ID(s) have been provided, they should be priorities that exist on the Jira site and are in use by the current scheme.
 *  ``The priorities with IDs [ID 1, ID 2, ...] provided as keys for the 'out' mappings object do not exist. Please provide existing priority IDs used by the current priority scheme.`` The listed priority ID(s) have been provided as keys for ``out`` mappings but are invalid. Please confirm the correct priority ID(s) have been provided, they should be priorities that exist on the Jira site and are in use by the current scheme.
 *  ``The priorities with IDs [ID 1, ID 2, ...] provided as values for the 'out' mappings object do not exist. Please provide existing priority IDs used by the default scheme.`` The listed priority ID(s) have been provided as values for ``out`` mappings but are invalid. Please confirm the correct priority ID(s) have been provided, they should be priorities that exist on the Jira site and are in use by the Default Priority Scheme, but are not in use by the current scheme.
 *  ``The priorities with IDs [ID 1, ID 2, ...] do not require mapping. Please remove these keys and their corresponding values from the 'in' mappings object.`` The listed priority ID(s) have been provided as keys for ``in`` mappings but are not required, they can be removed from the mappings object.
 *  ``The priorities with IDs [ID 1, ID 2, ...] require mapping. Please provide mappings in the 'in' mappings object, where these priorities are the keys with corresponding values.`` The listed priority ID(s) have not been provided as keys for ``in`` mappings but are required, add them to the mappings object.
 *  ``The priorities with IDs [ID 1, ID 2, ...] being mapped to are not in the current scheme. Please remove these values and their corresponding keys from the 'in' mappings object.`` The listed priority ID(s) have been provided as keys for ``in`` mappings but are not in use by the current scheme, they can be removed from the mappings object.
 *  ``The priorities with IDs [ID 1, ID 2, ...] do not require mapping. Please remove these keys and their corresponding values from the 'out' mappings object.`` The listed priority ID(s) hve been provided as keys for ``out`` mappings but are not required, they can be removed from the mappings object.
 *  ``The priorities with IDs [ID 1, ID 2, ...] require mapping. Please provide mappings in the 'out' mappings object, where these priorities are the keys with corresponding values.`` The listed priority ID(s) have not been provided as keys for ``out`` mappings but are required, add them to the mappings object.
 *  ``The priorities with IDs [ID 1, ID 2, ...] being mapped to are not in the default scheme. Please remove these values and their corresponding keys from the 'out' mappings object.`` The listed priority ID(s) have been provided as keys for ``out`` mappings but are not in use by the Default Priority Scheme, they can be removed from the mappings object.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user doesn't have the necessary permissions.
- **409**: Returned if an action with this priority scheme is still in progress.

---

## Get priorities by priority scheme

`GET /rest/api/2/priorityscheme/{schemeId}/priorities`

Returns a [paginated](#pagination) list of priorities by scheme.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **schemeId** (path): The priority scheme ID.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get projects by priority scheme

`GET /rest/api/2/priorityscheme/{schemeId}/projects`

Returns a [paginated](#pagination) list of projects by scheme.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **projectId** (query): The project IDs to filter by. For example, `projectId=10000&projectId=10001`.
- **schemeId** (path): The priority scheme ID.
- **query** (query): The string to query projects on by name.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request isn't valid.
- **401**: Returned if the authentication credentials are incorrect.

---

