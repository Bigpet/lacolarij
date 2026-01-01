# Service Registry

This resource represents a service registry. Use it to retrieve attributes related to a [service registry](https://support.atlassian.com/jira-service-management-cloud/docs/what-is-services/) in JSM.

## Retrieve the attributes of service registries

`GET /rest/atlassian-connect/1/service-registry`

Retrieve the attributes of given service registries.

**[Permissions](#permissions) required:** Only Connect apps can make this request and the servicesIds belong to the tenant you are requesting

### Parameters

- **serviceIds** (query): The ID of the services (the strings starting with "b:" need to be decoded in Base64).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: The request needs to be authenticated.
- **403**: The request isn't authorized.
- **500**: The endpoint failed internally.
- **501**: The endpoint isn't ready for receiving requests.
- **504**: The upstream service is busy.

---

