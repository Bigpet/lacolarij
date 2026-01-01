# Audit records

This resource represents audits that record activities undertaken in Jira. Use it to get a list of audit records.

## Get audit records

`GET /rest/api/3/auditing/record`

Returns a list of audit records. The list can be filtered to include items:

 *  where each item in `filter` has at least one match in any of these fields:
    
     *  `summary`
     *  `category`
     *  `eventSource`
     *  `objectItem.name` If the object is a user, account ID is available to filter.
     *  `objectItem.parentName`
     *  `objectItem.typeName`
     *  `changedValues.changedFrom`
     *  `changedValues.changedTo`
     *  `remoteAddress`
    
    For example, if `filter` contains *man ed*, an audit record containing `summary": "User added to group"` and `"category": "group management"` is returned.
 *  created on or after a date and time.
 *  created or or before a date and time.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **offset** (query): The number of records to skip before returning the first result.
- **limit** (query): The maximum number of results to return.
- **filter** (query): The strings to match with audit field content, space separated.
- **from** (query): The date and time on or after which returned audit records must have been created. If `to` is provided `from` must be before `to` or no audit records are returned.
- **to** (query): The date and time on or before which returned audit results must have been created. If `from` is provided `to` must be after `from` or no audit records are returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if:

 *  the user does not have the required permissions.
 *  all Jira products are on free plans. Audit logs are available when at least one Jira product is on a paid plan.

---

