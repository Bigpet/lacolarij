# Dynamic modules

This resource represents [modules registered dynamically](https://developer.atlassian.com/cloud/jira/platform/dynamic-modules/)
by [Connect apps](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps).

## Remove modules

`DELETE /rest/atlassian-connect/1/app/module/dynamic`

Remove all or a list of modules registered by the calling app.

**[Permissions](#permissions) required:** Only Connect apps can make this request.

### Parameters

- **moduleKey** (query): The key of the module to remove. To include multiple module keys, provide multiple copies of this parameter.
For example, `moduleKey=dynamic-attachment-entity-property&moduleKey=dynamic-select-field`.
Nonexistent keys are ignored.

### Responses

- **204**: Returned if the request is successful.
- **401**: Returned if the call is not from a Connect app.

---

## Get modules

`GET /rest/atlassian-connect/1/app/module/dynamic`

Returns all modules registered dynamically by the calling app.

**[Permissions](#permissions) required:** Only Connect apps can make this request.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the call is not from a Connect app.

---

## Register modules

`POST /rest/atlassian-connect/1/app/module/dynamic`

Registers a list of modules.

**[Permissions](#permissions) required:** Only Connect apps can make this request.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ConnectModules"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if:
* any of the provided modules is invalid. For example, required properties are missing.
* any of the modules conflict with registered dynamic modules or modules defined in the app descriptor. For example, there are duplicate keys.

Details of the issues encountered are included in the error message.
- **401**: Returned if the call is not from a Connect app.

---

