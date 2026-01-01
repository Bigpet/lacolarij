# Webhooks

This resource represents webhooks. Webhooks are calls sent to a URL when an event occurs in Jira for issues specified by a JQL query. Only Connect and OAuth 2.0 apps can register and manage webhooks. For more information, see [Webhooks](https://developer.atlassian.com/cloud/jira/platform/webhooks/#registering-a-webhook-via-the-jira-rest-api-for-connect-apps).

## Delete webhooks by ID

`DELETE /rest/api/3/webhook`

Removes webhooks by ID. Only webhooks registered by the calling app are removed. If webhooks created by other apps are specified, they are ignored.

**[Permissions](#permissions) required:** Only [Connect](https://developer.atlassian.com/cloud/jira/platform/#connect-apps) and [OAuth 2.0](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps) apps can use this operation.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ContainerForWebhookIDs"
}
```

### Responses

- **202**: Returned if the request is successful.
- **400**: Returned if the list of webhook IDs is missing.
- **403**: Returned if the caller isn't an app.

---

## Get dynamic webhooks for app

`GET /rest/api/3/webhook`

Returns a [paginated](#pagination) list of the webhooks registered by the calling app.

**[Permissions](#permissions) required:** Only [Connect](https://developer.atlassian.com/cloud/jira/platform/#connect-apps) and [OAuth 2.0](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps) apps can use this operation.

### Parameters

- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the caller isn't an app.

---

## Register dynamic webhooks

`POST /rest/api/3/webhook`

Registers webhooks.

**NOTE:** for non-public OAuth apps, webhooks are delivered only if there is a match between the app owner and the user who registered a dynamic webhook.

**[Permissions](#permissions) required:** Only [Connect](https://developer.atlassian.com/cloud/jira/platform/#connect-apps) and [OAuth 2.0](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps) apps can use this operation.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/WebhookRegistrationDetails"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the caller isn't an app.

---

## Get failed webhooks

`GET /rest/api/3/webhook/failed`

Returns webhooks that have recently failed to be delivered to the requesting app after the maximum number of retries.

After 72 hours the failure may no longer be returned by this operation.

The oldest failure is returned first.

This method uses a cursor-based pagination. To request the next page use the failure time of the last webhook on the list as the `failedAfter` value or use the URL provided in `next`.

**[Permissions](#permissions) required:** Only [Connect apps](https://developer.atlassian.com/cloud/jira/platform/index/#connect-apps) can use this operation.

### Parameters

- **maxResults** (query): The maximum number of webhooks to return per page. If obeying the maxResults directive would result in records with the same failure time being split across pages, the directive is ignored and all records with the same failure time included on the page.
- **after** (query): The time after which any webhook failure must have occurred for the record to be returned, expressed as milliseconds since the UNIX epoch.

### Responses

- **200**: Returned if the request is successful.
- **400**: 400 response
- **403**: Returned if the caller is not a Connect app.

---

## Extend webhook life

`PUT /rest/api/3/webhook/refresh`

Extends the life of webhook. Webhooks registered through the REST API expire after 30 days. Call this operation to keep them alive.

Unrecognized webhook IDs (those that are not found or belong to other apps) are ignored.

**[Permissions](#permissions) required:** Only [Connect](https://developer.atlassian.com/cloud/jira/platform/#connect-apps) and [OAuth 2.0](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps) apps can use this operation.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/ContainerForWebhookIDs"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the caller isn't an app.

---

