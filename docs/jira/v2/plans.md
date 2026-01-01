# Plans

This resource represents plans. Use it to get, create, duplicate, update, trash and archive plans.

## Get plans paginated

`GET /rest/api/2/plans/plan`

Returns a [paginated](#pagination) list of plans.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **includeTrashed** (query): Whether to include trashed plans in the results.
- **includeArchived** (query): Whether to include archived plans in the results.
- **cursor** (query): The cursor to start from. If not provided, the first page will be returned.
- **maxResults** (query): The maximum number of plans to return per page. The maximum value is 50. The default value is 50.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.

---

## Create plan

`POST /rest/api/2/plans/plan`

Creates a plan.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **useGroupId** (query): Whether to accept group IDs instead of group names. Group names are deprecated.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreatePlanRequest" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.

---

## Get plan

`GET /rest/api/2/plans/plan/{planId}`

Returns a plan.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.
- **useGroupId** (query): Whether to return group IDs instead of group names. Group names are deprecated.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan is not found.

---

## Update plan

`PUT /rest/api/2/plans/plan/{planId}`

Updates any of the following details of a plan using [JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902).

 *  name
 *  leadAccountId
 *  scheduling
    
     *  estimation with StoryPoints, Days or Hours as possible values
     *  startDate
        
         *  type with DueDate, TargetStartDate, TargetEndDate or DateCustomField as possible values
         *  dateCustomFieldId
     *  endDate
        
         *  type with DueDate, TargetStartDate, TargetEndDate or DateCustomField as possible values
         *  dateCustomFieldId
     *  inferredDates with None, SprintDates or ReleaseDates as possible values
     *  dependencies with Sequential or Concurrent as possible values
 *  issueSources
    
     *  type with Board, Project or Filter as possible values
     *  value
 *  exclusionRules
    
     *  numberOfDaysToShowCompletedIssues
     *  issueIds
     *  workStatusIds
     *  workStatusCategoryIds
     *  issueTypeIds
     *  releaseIds
 *  crossProjectReleases
    
     *  name
     *  releaseIds
 *  customFields
    
     *  customFieldId
     *  filter
 *  permissions
    
     *  type with View or Edit as possible values
     *  holder
        
         *  type with Group or AccountId as possible values
         *  value

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

*Note that "add" operations do not respect array indexes in target locations. Call the "Get plan" endpoint to find out the order of array elements.*

### Parameters

- **planId** (path): The ID of the plan.
- **useGroupId** (query): Whether to accept group IDs instead of group names. Group names are deprecated.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan is not found.
- **409**: Returned if the plan is not active.

---

## Archive plan

`PUT /rest/api/2/plans/plan/{planId}/archive`

Archives a plan.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan is not found.
- **409**: Returned if the plan is not active.

---

## Duplicate plan

`POST /rest/api/2/plans/plan/{planId}/duplicate`

Duplicates a plan.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/DuplicatePlanRequest" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan to duplicate is not found.
- **409**: Returned if the plan to duplicate is not active.

---

## Trash plan

`PUT /rest/api/2/plans/plan/{planId}/trash`

Moves a plan to trash.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan is not found.
- **409**: Returned if the plan is not active.

---

