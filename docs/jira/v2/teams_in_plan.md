# Teams in plan

This resource represents planning settings for plan-only and Atlassian teams in a plan. Use it to get, create, update and delete planning settings.

## Get teams in plan paginated

`GET /rest/api/2/plans/plan/{planId}/team`

Returns a [paginated](#pagination) list of plan-only and Atlassian teams in a plan.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.
- **cursor** (query): The cursor to start from. If not provided, the first page will be returned.
- **maxResults** (query): The maximum number of plan teams to return per page. The maximum value is 50. The default value is 50.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan is not found.

---

## Add Atlassian team to plan

`POST /rest/api/2/plans/plan/{planId}/team/atlassian`

Adds an existing Atlassian team to a plan and configures their plannning settings.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/AddAtlassianTeamRequest" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or Atlassian team is not found.
- **409**: Returned if the plan is not active.

---

## Remove Atlassian team from plan

`DELETE /rest/api/2/plans/plan/{planId}/team/atlassian/{atlassianTeamId}`

Removes an Atlassian team from a plan and deletes their planning settings.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.
- **atlassianTeamId** (path): The ID of the Atlassian team.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or Atlassian team is not found, or the Atlassian team is not associated with the plan.
- **409**: Returned if the plan is not active.

---

## Get Atlassian team in plan

`GET /rest/api/2/plans/plan/{planId}/team/atlassian/{atlassianTeamId}`

Returns planning settings for an Atlassian team in a plan.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.
- **atlassianTeamId** (path): The ID of the Atlassian team.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or Atlassian team is not found, or the Atlassian team is not associated with the plan.
- **409**: Returned if the plan is not active.

---

## Update Atlassian team in plan

`PUT /rest/api/2/plans/plan/{planId}/team/atlassian/{atlassianTeamId}`

Updates any of the following planning settings of an Atlassian team in a plan using [JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902).

 *  planningStyle
 *  issueSourceId
 *  sprintLength
 *  capacity

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

*Note that "add" operations do not respect array indexes in target locations. Call the "Get Atlassian team in plan" endpoint to find out the order of array elements.*

### Parameters

- **planId** (path): The ID of the plan.
- **atlassianTeamId** (path): The ID of the Atlassian team.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or Atlassian team is not found, or the Atlassian team is not associated with the plan.
- **409**: Returned if the plan is not active.

---

## Create plan-only team

`POST /rest/api/2/plans/plan/{planId}/team/planonly`

Creates a plan-only team and configures their planning settings.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CreatePlanOnlyTeamRequest" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan is not found.
- **409**: Returned if the plan is not active.

---

## Delete plan-only team

`DELETE /rest/api/2/plans/plan/{planId}/team/planonly/{planOnlyTeamId}`

Deletes a plan-only team and their planning settings.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.
- **planOnlyTeamId** (path): The ID of the plan-only team.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or plan-only team is not found, or the plan-only team is not associated with the plan.
- **409**: Returned if the plan is not active.

---

## Get plan-only team

`GET /rest/api/2/plans/plan/{planId}/team/planonly/{planOnlyTeamId}`

Returns planning settings for a plan-only team.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **planId** (path): The ID of the plan.
- **planOnlyTeamId** (path): The ID of the plan-only team.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or plan-only team is not found, or the plan-only team is not associated with the plan.
- **409**: Returned if the plan is not active.

---

## Update plan-only team

`PUT /rest/api/2/plans/plan/{planId}/team/planonly/{planOnlyTeamId}`

Updates any of the following planning settings of a plan-only team using [JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902).

 *  name
 *  planningStyle
 *  issueSourceId
 *  sprintLength
 *  capacity
 *  memberAccountIds

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

*Note that "add" operations do not respect array indexes in target locations. Call the "Get plan-only team" endpoint to find out the order of array elements.*

### Parameters

- **planId** (path): The ID of the plan.
- **planOnlyTeamId** (path): The ID of the plan-only team.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the user is not logged in.
- **403**: Returned if the site has no premium edition of Jira or if the user does not have the Administer Jira global permission.
- **404**: Returned if the plan or plan-only team is not found, or the plan-only team is not associated with the plan.
- **409**: Returned if the plan is not active.

---

