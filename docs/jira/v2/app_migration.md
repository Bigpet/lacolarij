# App migration

This resource supports [app migrations](https://developer.atlassian.com/platform/app-migration/). Use it to:
- [to request migrated workflow rules details](https://developer.atlassian.com/platform/app-migration/tutorials/migration-app-workflow-rules/).
- [perform bulk updates of entity properties](https://developer.atlassian.com/platform/app-migration/tutorials/entity-properties-bulk-api/).
- [perform bulk updates of issue custom field values](https://developer.atlassian.com/platform/app-migration/tutorials/migrating-app-custom-fields/).

## Bulk update custom field value

`PUT /rest/atlassian-connect/1/migration/field`

Updates the value of a custom field added by Connect apps on one or more issues.
The values of up to 200 custom fields can be updated.

**[Permissions](#permissions) required:** Only Connect apps can make this request

### Parameters

- **Atlassian-Transfer-Id** (header): The ID of the transfer.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/ConnectCustomFieldValues" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if:
* the transfer ID is not found.
* the authorisation credentials are incorrect or missing.

---

## Bulk update entity properties

`PUT /rest/atlassian-connect/1/migration/properties/{entityType}`

Updates the values of multiple entity properties for an object, up to 50 updates per request. This operation is for use by Connect apps during app migration.

### Parameters

- **Atlassian-Transfer-Id** (header): The app migration transfer ID.
- **entityType** (path): The type indicating the object that contains the entity properties.

### Request Body

**application/json**

```json
[ { "$ref": "#/components/schemas/EntityPropertyDetails" } ]
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **403**: Returned if the authorisation credentials are incorrect or missing.

---

## Get workflow transition rule configurations

`POST /rest/atlassian-connect/1/migration/workflow/rule/search`

Returns configurations for workflow transition rules migrated from server to cloud and owned by the calling Connect app.

### Parameters

- **Atlassian-Transfer-Id** (header): The app migration transfer ID.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/WorkflowRulesSearch" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **403**: Returned if the authorisation credentials are incorrect or missing.

---

