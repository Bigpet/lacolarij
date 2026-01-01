# Issue custom field options (apps)

This resource represents custom issue field select list options created by a Connect app. See [Issue custom field options](#api-group-Issue-custom-field-options) to manipulate options created in Jira or using the REST API.

A select list issue field is a type of [issue field](https://developer.atlassian.com/cloud/jira/platform/modules/issue-field/) that enables a user to select an option from a list. Use it to add, remove, and update the options of a select list issue field.

## Get all issue field options

`GET /rest/api/2/field/{fieldKey}/option`

Returns a [paginated](#pagination) list of all the options of a select list issue field. A select list issue field is a type of [issue field](https://developer.atlassian.com/cloud/jira/platform/modules/issue-field/) that enables a user to select a value from a list of options.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). Jira permissions are not required for the app providing the field.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the field is not found or does not support options.
- **403**: Returned if the request is not authenticated as a Jira administrator or the app that provided the field.

---

## Create issue field option

`POST /rest/api/2/field/{fieldKey}/option`

Creates an option for a select list issue field.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

Each field can have a maximum of 10000 options, and each option can have a maximum of 10000 scopes.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). Jira permissions are not required for the app providing the field.

### Parameters

- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueFieldOptionCreateBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the option is invalid.
- **403**: Returned if the request is not authenticated as a Jira administrator or the app that provided the field.
- **404**: Returned if the field is not found or does not support options.

---

## Get selectable issue field options

`GET /rest/api/2/field/{fieldKey}/option/suggestions/edit`

Returns a [paginated](#pagination) list of options for a select list issue field that can be viewed and selected by the user.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **projectId** (query): Filters the results to options that are only available in the specified project.
- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the field is not found or does not support options.

---

## Get visible issue field options

`GET /rest/api/2/field/{fieldKey}/option/suggestions/search`

Returns a [paginated](#pagination) list of options for a select list issue field that can be viewed by the user.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **projectId** (query): Filters the results to options that are only available in the specified project.
- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the field is not found or does not support options.

---

## Delete issue field option

`DELETE /rest/api/2/field/{fieldKey}/option/{optionId}`

Deletes an option from a select list issue field.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). Jira permissions are not required for the app providing the field.

### Parameters

- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`
- **optionId** (path): The ID of the option to be deleted.

### Responses

- **204**: Returned if the field option is deleted.
- **403**: Returned if the request is not authenticated as a Jira administrator or the app that provided the field.
- **404**: Returned if the field or option is not found.
- **409**: Returned if the option is selected for the field in any issue.

---

## Get issue field option

`GET /rest/api/2/field/{fieldKey}/option/{optionId}`

Returns an option from a select list issue field.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). Jira permissions are not required for the app providing the field.

### Parameters

- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`
- **optionId** (path): The ID of the option to be returned.

### Responses

- **200**: Returned if the requested option is returned.
- **400**: Returned if the field is not found or does not support options.
- **403**: Returned if the request is not authenticated as a Jira administrator or the app that provided the field.
- **404**: Returned if the option is not found.

---

## Update issue field option

`PUT /rest/api/2/field/{fieldKey}/option/{optionId}`

Updates or creates an option for a select list issue field. This operation requires that the option ID is provided when creating an option, therefore, the option ID needs to be specified as a path and body parameter. The option ID provided in the path and body must be identical.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). Jira permissions are not required for the app providing the field.

### Parameters

- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`
- **optionId** (path): The ID of the option to be updated.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueFieldOption" }
```

### Responses

- **200**: Returned if the option is updated or created.
- **400**: Returned if the option is invalid, or the *ID* in the request object does not match the *optionId* parameter.
- **403**: Returned if the request is not authenticated as a Jira administrator or the app that provided the field.
- **404**: Returned if field is not found.

---

## Replace issue field option

`DELETE /rest/api/2/field/{fieldKey}/option/{optionId}/issue`

Deselects an issue-field select-list option from all issues where it is selected. A different option can be selected to replace the deselected option. The update can also be limited to a smaller set of issues by using a JQL query.

Connect and Forge app users with *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) can override the screen security configuration using `overrideScreenSecurity` and `overrideEditableFlag`.

This is an [asynchronous operation](#async). The response object contains a link to the long-running task.

Note that this operation **only works for issue field select list options added by Connect apps**, it cannot be used with issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). Jira permissions are not required for the app providing the field.

### Parameters

- **replaceWith** (query): The ID of the option that will replace the currently selected option.
- **jql** (query): A JQL query that specifies the issues to be updated. For example, *project=10000*.
- **overrideScreenSecurity** (query): Whether screen security is overridden to enable hidden fields to be edited. Available to Connect and Forge app users with admin permission.
- **overrideEditableFlag** (query): Whether screen security is overridden to enable uneditable fields to be edited. Available to Connect and Forge app users with *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).
- **fieldKey** (path): The field key is specified in the following format: **$(app-key)\_\_$(field-key)**. For example, *example-add-on\_\_example-issue-field*. To determine the `fieldKey` value, do one of the following:

 *  open the app's plugin descriptor, then **app-key** is the key at the top and **field-key** is the key in the `jiraIssueFields` module. **app-key** can also be found in the app listing in the Atlassian Universal Plugin Manager.
 *  run [Get fields](#api-rest-api-2-field-get) and in the field details the value is returned in `key`. For example, `"key": "teams-add-on__team-issue-field"`
- **optionId** (path): The ID of the option to be deselected.

### Responses

- **303**: Returned if the long-running task to deselect the option is started.
- **400**: Returned if the request is not valid.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the field is not found or does not support options, or the options to be replaced are not found.

---

