# Issue properties

This resource represents [issue](#api-group-Issues) properties, which provides for storing custom data against an issue. Use it to get, set, and delete issue properties as well as obtain details of all properties on an issue. Operations to bulk update and delete issue properties are also provided. Issue properties are a type of [entity property](https://developer.atlassian.com/cloud/jira/platform/jira-entity-properties/).

## Bulk set issues properties by list

`POST /rest/api/3/issue/properties`

Sets or updates a list of entity property values on issues. A list of up to 10 entity properties can be specified along with up to 10,000 issues on which to set or update that list of entity properties.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON. The maximum length of single issue property value is 32768 characters. This operation can be accessed anonymously.

This operation is:

 *  transactional, either all properties are updated in all eligible issues or, when errors occur, no properties are updated.
 *  [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-3-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Edit issues* [project permissions](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueEntityProperties"
}
```

### Responses

- **303**: Returned if the operation is successful.
- **400**: Return if the request is invalid or the user does not have the necessary permission.
- **401**: Returned if the authentication credentials are incorrect.

---

## Bulk set issue properties by issue

`POST /rest/api/3/issue/properties/multi`

Sets or updates entity property values on issues. Up to 10 entity properties can be specified for each issue and up to 100 issues included in the request.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON.

This operation is:

 *  [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-3-task-taskId-get) to obtain subsequent updates.
 *  non-transactional. Updating some entities may fail. Such information will available in the task result.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Edit issues* [project permissions](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/MultiIssueEntityProperties"
}
```

### Responses

- **303**: Returned if the operation is successful.
- **400**: Return if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Return if the user does not have the necessary permission.

---

## Bulk delete issue property

`DELETE /rest/api/3/issue/properties/{propertyKey}`

Deletes a property value from multiple issues. The issues to be updated can be specified by filter criteria.

The criteria the filter used to identify eligible issues are:

 *  `entityIds` Only issues from this list are eligible.
 *  `currentValue` Only issues with the property set to this value are eligible.

If both criteria is specified, they are joined with the logical *AND*: only issues that satisfy both criteria are considered eligible.

If no filter criteria are specified, all the issues visible to the user and where the user has the EDIT\_ISSUES permission for the issue are considered eligible.

This operation is:

 *  transactional, either the property is deleted from all eligible issues or, when errors occur, no properties are deleted.
 *  [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-3-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:**

 *  *Browse projects* [ project permission](https://confluence.atlassian.com/x/yodKLg) for each project containing issues.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Edit issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for each issue.

### Parameters

- **propertyKey** (path): The key of the property.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssueFilterForBulkPropertyDelete"
}
```

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Bulk set issue property

`PUT /rest/api/3/issue/properties/{propertyKey}`

Sets a property value on multiple issues.

The value set can be a constant or determined by a [Jira expression](https://developer.atlassian.com/cloud/jira/platform/jira-expressions/). Expressions must be computable with constant complexity when applied to a set of issues. Expressions must also comply with the [restrictions](https://developer.atlassian.com/cloud/jira/platform/jira-expressions/#restrictions) that apply to all Jira expressions.

The issues to be updated can be specified by a filter.

The filter identifies issues eligible for update using these criteria:

 *  `entityIds` Only issues from this list are eligible.
 *  `currentValue` Only issues with the property set to this value are eligible.
 *  `hasProperty`:
    
     *  If *true*, only issues with the property are eligible.
     *  If *false*, only issues without the property are eligible.

If more than one criteria is specified, they are joined with the logical *AND*: only issues that satisfy all criteria are eligible.

If an invalid combination of criteria is provided, an error is returned. For example, specifying a `currentValue` and `hasProperty` as *false* would not match any issues (because without the property the property cannot have a value).

The filter is optional. Without the filter all the issues visible to the user and where the user has the EDIT\_ISSUES permission for the issue are considered eligible.

This operation is:

 *  transactional, either all eligible issues are updated or, when errors occur, none are updated.
 *  [asynchronous](#async). Follow the `location` link in the response to determine the status of the task and use [Get task](#api-rest-api-3-task-taskId-get) to obtain subsequent updates.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for each project containing issues.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Edit issues* [project permission](https://confluence.atlassian.com/x/yodKLg) for each issue.

### Parameters

- **propertyKey** (path): The key of the property. The maximum length is 255 characters.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/BulkIssuePropertyUpdateRequest"
}
```

### Responses

- **303**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get issue property keys

`GET /rest/api/3/issue/{issueIdOrKey}/properties`

Returns the URLs and keys of an issue's properties.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Property details are only returned where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The key or ID of the issue.

### Responses

- **200**: Returned if the request is successful.
- **404**: Returned if the issue is not found or the user does not have permissions to view the issue.

---

## Delete issue property

`DELETE /rest/api/3/issue/{issueIdOrKey}/properties/{propertyKey}`

Deletes an issue's property.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Edit issues* [project permissions](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The key or ID of the issue.
- **propertyKey** (path): The key of the property.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue or property is not found, or the user does not have permission to edit the issue.

---

## Get issue property

`GET /rest/api/3/issue/{issueIdOrKey}/properties/{propertyKey}`

Returns the key and value of an issue's property.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The key or ID of the issue.
- **propertyKey** (path): The key of the property.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue or property is not found or the user does not have permission to see the issue.

---

## Set issue property

`PUT /rest/api/3/issue/{issueIdOrKey}/properties/{propertyKey}`

Sets the value of an issue's property. Use this resource to store custom data against an issue.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Edit issues* [project permissions](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **propertyKey** (path): The key of the issue property. The maximum length is 255 characters.

### Request Body

**application/json**

```json
{}
```

### Responses

- **200**: Returned if the issue property is updated.
- **201**: Returned if the issue property is created.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have permission to edit the issue.
- **404**: Returned if the issue is not found or the user does not have permission to view the issue.

---

