# Issue custom field options

This resource represents custom issue field select list options created in Jira or using the REST API. This resource supports the following field types:

 *  Checkboxes.
 *  Radio Buttons.
 *  Select List (single choice).
 *  Select List (multiple choices).
 *  Select List (cascading).

See [Issue custom field options (apps)](#api-group-Issue-custom-field-options--apps-) to manipulate custom issue field select list options created by a Connect app.

Use it to retrieve, create, update, order, and delete custom field options.

## Get custom field option

`GET /rest/api/2/customFieldOption/{id}`

Returns a custom field option. For example, an option in a select list.

Note that this operation **only works for issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource**, it cannot be used with issue field select list options created by Connect apps.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** The custom field option is returned as follows:

 *  if the user has the *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).
 *  if the user has the *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for at least one project the custom field is used in, and the field is visible in at least one layout the user has permission to view.

### Parameters

- **id** (path): The ID of the custom field option.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if:

 *  the custom field option is not found.
 *  the user does not have permission to view the custom field.

---

## Get custom field options (context)

`GET /rest/api/2/field/{fieldId}/context/{contextId}/option`

Returns a [paginated](#pagination) list of all custom field option for a context. Options are returned first then cascading options, in the order they display in Jira.

This operation works for custom field options created in Jira or the operations from this resource. **To work with issue field select list options created for Connect apps use the [Issue custom field options (apps)](#api-group-issue-custom-field-options--apps-) operations.**

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg). *Edit Workflow* [edit workflow permission](https://support.atlassian.com/jira-cloud-administration/docs/permissions-for-company-managed-projects/#Edit-Workflows)

### Parameters

- **fieldId** (path): The ID of the custom field.
- **contextId** (path): The ID of the context.
- **optionId** (query): The ID of the option.
- **onlyOptions** (query): Whether only options are returned.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the custom field is not found or the context doesn't match the custom field.

---

## Create custom field options (context)

`POST /rest/api/2/field/{fieldId}/context/{contextId}/option`

Creates options and, where the custom select field is of the type Select List (cascading), cascading options for a custom select field. The options are added to a context of the field.

The maximum number of options that can be created per request is 1000 and each field can have a maximum of 10000 options.

This operation works for custom field options created in Jira or the operations from this resource. **To work with issue field select list options created for Connect apps use the [Issue custom field options (apps)](#api-group-issue-custom-field-options--apps-) operations.**

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the custom field.
- **contextId** (path): The ID of the context.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/BulkCustomFieldOptionCreateRequest" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the custom field is not found or the context doesn't match the custom field.

---

## Update custom field options (context)

`PUT /rest/api/2/field/{fieldId}/context/{contextId}/option`

Updates the options of a custom field.

If any of the options are not found, no options are updated. Options where the values in the request match the current values aren't updated and aren't reported in the response.

Note that this operation **only works for issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource**, it cannot be used with issue field select list options created by Connect apps.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the custom field.
- **contextId** (path): The ID of the context.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/BulkCustomFieldOptionUpdateRequest" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the field, context, or one or more options is not found.

---

## Reorder custom field options (context)

`PUT /rest/api/2/field/{fieldId}/context/{contextId}/option/move`

Changes the order of custom field options or cascading options in a context.

This operation works for custom field options created in Jira or the operations from this resource. **To work with issue field select list options created for Connect apps use the [Issue custom field options (apps)](#api-group-issue-custom-field-options--apps-) operations.**

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the custom field.
- **contextId** (path): The ID of the context.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/OrderOfCustomFieldOptions" }
```

### Responses

- **204**: Returned if options are reordered.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the field, the context, or one or more of the options is not found..

---

## Delete custom field options (context)

`DELETE /rest/api/2/field/{fieldId}/context/{contextId}/option/{optionId}`

Deletes a custom field option.

Options with cascading options cannot be deleted without deleting the cascading options first.

This operation works for custom field options created in Jira or the operations from this resource. **To work with issue field select list options created for Connect apps use the [Issue custom field options (apps)](#api-group-issue-custom-field-options--apps-) operations.**

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **fieldId** (path): The ID of the custom field.
- **contextId** (path): The ID of the context from which an option should be deleted.
- **optionId** (path): The ID of the option to delete.

### Responses

- **204**: Returned if the option is deleted.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the field, the context, or the option is not found.

---

## Replace custom field options

`DELETE /rest/api/2/field/{fieldId}/context/{contextId}/option/{optionId}/issue`

Replaces the options of a custom field.

Note that this operation **only works for issue field select list options created in Jira or using operations from the [Issue custom field options](#api-group-Issue-custom-field-options) resource**, it cannot be used with issue field select list options created by Connect or Forge apps.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **replaceWith** (query): The ID of the option that will replace the currently selected option.
- **jql** (query): A JQL query that specifies the issues to be updated. For example, *project=10000*.
- **fieldId** (path): The ID of the custom field.
- **optionId** (path): The ID of the option to be deselected.
- **contextId** (path): The ID of the context.

### Responses

- **303**: Returned if the long-running task to deselect the option is started.
- **400**: Returned if the request is not valid.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the field is not found or does not support options, or the options to be replaced are not found.

---

