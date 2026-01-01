# License metrics

This resource represents license metrics. Use it to get available metrics for Jira licences.

## Get license

`GET /rest/api/3/instance/license`

Returns licensing information about the Jira instance.

**[Permissions](#permissions) required:** None.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get approximate license count

`GET /rest/api/3/license/approximateLicenseCount`

Returns the approximate number of user accounts across all Jira licenses. Note that this information is cached with a 7-day lifecycle and could be stale at the time of call.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to complete this request.

---

## Get approximate application license count

`GET /rest/api/3/license/approximateLicenseCount/product/{applicationKey}`

Returns the total approximate number of user accounts for a single Jira license. Note that this information is cached with a 7-day lifecycle and could be stale at the time of call.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **applicationKey** (path): The ID of the application, represents a specific version of Jira.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to complete this request.

---

