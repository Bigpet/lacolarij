# App properties

This resource represents app properties. Use it to store arbitrary data for your
[Connect app](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps).

## Get app properties

`GET /rest/atlassian-connect/1/addons/{addonKey}/properties`

Gets all the properties of an app.

**[Permissions](#permissions) required:** Only a Connect app whose key matches `addonKey` can make this request.
Additionally, Forge apps can access Connect app properties (stored against the same `app.connect.key`).

### Parameters

- **addonKey** (path): The key of the app, as defined in its descriptor.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Delete app property

`DELETE /rest/atlassian-connect/1/addons/{addonKey}/properties/{propertyKey}`

Deletes an app's property.

**[Permissions](#permissions) required:** Only a Connect app whose key matches `addonKey` can make this request.
Additionally, Forge apps can access Connect app properties (stored against the same `app.connect.key`).

### Parameters

- **addonKey** (path): The key of the app, as defined in its descriptor.
- **propertyKey** (path): The key of the property.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the property key is longer than 127 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the property is not found or doesn't belong to the app.

---

## Get app property

`GET /rest/atlassian-connect/1/addons/{addonKey}/properties/{propertyKey}`

Returns the key and value of an app's property.

**[Permissions](#permissions) required:** Only a Connect app whose key matches `addonKey` can make this request.
Additionally, Forge apps can access Connect app properties (stored against the same `app.connect.key`).

### Parameters

- **addonKey** (path): The key of the app, as defined in its descriptor.
- **propertyKey** (path): The key of the property.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the property key is longer than 127 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the property is not found or doesn't belong to the app.

---

## Set app property

`PUT /rest/atlassian-connect/1/addons/{addonKey}/properties/{propertyKey}`

Sets the value of an app's property. Use this resource to store custom data for your app.

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

**[Permissions](#permissions) required:** Only a Connect app whose key matches `addonKey` can make this request.
Additionally, Forge apps can access Connect app properties (stored against the same `app.connect.key`).

### Parameters

- **addonKey** (path): The key of the app, as defined in its descriptor.
- **propertyKey** (path): The key of the property.

### Request Body

**application/json**

```json
{}
```

### Responses

- **200**: Returned if the property is updated.
- **201**: Returned is the property is created.
- **400**: Returned if:
  * the property key is longer than 127 characters.
  * the value is not valid JSON.
  * the value is longer than 32768 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Get app property keys (Forge)

`GET /rest/forge/1/app/properties`

Returns all property keys for the Forge app.

**[Permissions](#permissions) required:** Only Forge apps can make this request. This API can only be accessed using **[asApp()](https://developer.atlassian.com/platform/forge/apis-reference/fetch-api-product.requestjira/#method-signature)** requests from Forge.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request isn't made directly by an app or if it's an impersonated request.

---

## Delete app property (Forge)

`DELETE /rest/forge/1/app/properties/{propertyKey}`

Deletes a Forge app's property.

**[Permissions](#permissions) required:** Only Forge apps can make this request. This API can only be accessed using **[asApp()](https://developer.atlassian.com/platform/forge/apis-reference/fetch-api-product.requestjira/#method-signature)** requests from Forge.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **propertyKey** (path): The key of the property.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the property key is longer than 127 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request isn't made directly by an app or if it's an impersonated request.
- **404**: Returned if the property isn't found or doesn't belong to the app.

---

## Get app property (Forge)

`GET /rest/forge/1/app/properties/{propertyKey}`

Returns the value of a Forge app's property.

**[Permissions](#permissions) required:** Only Forge apps can make this request. This API can only be accessed using **[asApp()](https://developer.atlassian.com/platform/forge/apis-reference/fetch-api-product.requestjira/#method-signature)** requests from Forge.

### Parameters

- **propertyKey** (path): The key of the property.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the property key is longer than 127 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request isn't made directly by an app or if it's an impersonated request.
- **404**: Returned if the property isn't found or doesn't belong to the app.

---

## Set app property (Forge)

`PUT /rest/forge/1/app/properties/{propertyKey}`

Sets the value of a Forge app's property.
These values can be retrieved in [Jira expressions](/cloud/jira/platform/jira-expressions/)
through the `app` [context variable](/cloud/jira/platform/jira-expressions/#context-variables).
They are also available in [entity property display conditions](/platform/forge/manifest-reference/display-conditions/entity-property-conditions/).

For other use cases, use the [Storage API](/platform/forge/runtime-reference/storage-api/).

The value of the request body must be a [valid](http://tools.ietf.org/html/rfc4627), non-empty JSON blob. The maximum length is 32768 characters.

**[Permissions](#permissions) required:** Only Forge apps can make this request. This API can only be accessed using **[asApp()](https://developer.atlassian.com/platform/forge/apis-reference/fetch-api-product.requestjira/#method-signature)** requests from Forge.

The new `write:app-data:jira` OAuth scope is 100% optional now, and not using it won't break your app. However, we recommend adding it to your app's scope list because we will eventually make it mandatory.

### Parameters

- **propertyKey** (path): The key of the property.

### Request Body

**application/json**

```json
{}
```

### Responses

- **200**: Returned if the property is updated.
- **201**: Returned is the property is created.
- **400**: Returned if:
  * the property key is longer than 127 characters.
  * the value isn't valid JSON.
  * the value is longer than 32768 characters.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the request isn't made directly by an app or if it's an impersonated request.

---

