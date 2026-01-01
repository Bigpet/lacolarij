# Workflow transition rules

This resource represents workflow transition rules. Workflow transition rules define a Connect or a Forge app routine, such as a [workflow post functions](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-post-function/) that is executed in association with the workflow. Use it to read and modify configuration of workflow transition rules.

## Get workflow transition rule configurations

`GET /rest/api/3/workflow/rule/config`

Returns a [paginated](#pagination) list of workflows with transition rules. The workflows can be filtered to return only those containing workflow transition rules:

 *  of one or more transition rule types, such as [workflow post functions](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-post-function/).
 *  matching one or more transition rule keys.

Only workflows containing transition rules created by the calling [Connect](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps) or [Forge](https://developer.atlassian.com/cloud/jira/platform/index/#forge-apps) app are returned.

Due to server-side optimizations, workflows with an empty list of rules may be returned; these workflows can be ignored.

**[Permissions](#permissions) required:** Only [Connect](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps) or [Forge](https://developer.atlassian.com/cloud/jira/platform/index/#forge-apps) apps can use this operation.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **types** (query): The types of the transition rules to return.
- **keys** (query): The transition rule class keys, as defined in the Connect or the Forge app descriptor, of the transition rules to return.
- **workflowNames** (query): The list of workflow names to filter by.
- **withTags** (query): The list of `tags` to filter by.
- **draft** (query): Whether draft or published workflows are returned. If not provided, both workflow types are returned.
- **expand** (query): Use [expand](#expansion) to include additional information in the response. This parameter accepts `transition`, which, for each rule, returns information about the transition the rule is assigned to.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the caller is not a Connect or Forge app.
- **404**: Returned if any transition rule type is not supported.
- **503**: Returned if we encounter a problem while trying to access the required data.

---

## Update workflow transition rule configurations

`PUT /rest/api/3/workflow/rule/config`

Updates configuration of workflow transition rules. The following rule types are supported:

 *  [post functions](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-post-function/)
 *  [conditions](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-condition/)
 *  [validators](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-validator/)

Only rules created by the calling [Connect](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps) or [Forge](https://developer.atlassian.com/cloud/jira/platform/index/#forge-apps) app can be updated.

To assist with app migration, this operation can be used to:

 *  Disable a rule.
 *  Add a `tag`. Use this to filter rules in the [Get workflow transition rule configurations](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflow-transition-rules/#api-rest-api-3-workflow-rule-config-get).

Rules are enabled if the `disabled` parameter is not provided.

**[Permissions](#permissions) required:** Only [Connect](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps) or [Forge](https://developer.atlassian.com/cloud/jira/platform/index/#forge-apps) apps can use this operation.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/WorkflowTransitionRulesUpdate"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the caller is not a Connect or Forge app.
- **503**: Returned if we encounter a problem while trying to access the required data.

---

## Delete workflow transition rule configurations

`PUT /rest/api/3/workflow/rule/config/delete`

Deletes workflow transition rules from one or more workflows. These rule types are supported:

 *  [post functions](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-post-function/)
 *  [conditions](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-condition/)
 *  [validators](https://developer.atlassian.com/cloud/jira/platform/modules/workflow-validator/)

Only rules created by the calling Connect app can be deleted.

**[Permissions](#permissions) required:** Only Connect apps can use this operation.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/WorkflowsWithTransitionRulesDetails"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the caller is not a Connect app.

---

