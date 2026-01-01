# Issue custom field values (apps)

This resource represents the values of custom fields added by [Forge apps](https://developer.atlassian.com/platform/forge/). Use it to update the value of a custom field on issues.

## Update custom fields

`POST /rest/api/2/app/field/value`

Updates the value of one or more custom fields on one or more issues. Combinations of custom field and issue should be unique within the request.

Apps can only perform this operation on [custom fields](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-custom-field/) and [custom field types](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-custom-field-type/) declared in their own manifests.

**[Permissions](#permissions) required:** Only the app that owns the custom field or custom field type can update its values with this operation.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **generateChangelog** (query): Whether to generate a changelog for this update.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/MultipleCustomFieldValuesUpdateDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the request is not authenticated as the app that provided all the fields.
- **404**: Returned if any field is not found.

---

## Update custom field value

`PUT /rest/api/2/app/field/{fieldIdOrKey}/value`

Updates the value of a custom field on one or more issues.

Apps can only perform this operation on [custom fields](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-custom-field/) and [custom field types](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-custom-field-type/) declared in their own manifests.

**[Permissions](#permissions) required:** Only the app that owns the custom field or custom field type can update its values with this operation.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **fieldIdOrKey** (path): The ID or key of the custom field. For example, `customfield_10010`.
- **generateChangelog** (query): Whether to generate a changelog for this update.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/CustomFieldValueUpdateDetails" }
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the request is not authenticated as the app that provided the field.
- **404**: Returned if the field is not found.

---

