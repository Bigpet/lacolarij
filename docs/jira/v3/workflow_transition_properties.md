# Workflow transition properties

This resource represents workflow transition properties, which provides for storing custom data against a workflow transition. Use it to get, create, and delete workflow transition properties as well as get a list of property keys for a workflow transition. Workflow transition properties are a type of [entity property](https://developer.atlassian.com/cloud/jira/platform/jira-entity-properties/).

## Delete workflow transition property

`DELETE /rest/api/3/workflow/transitions/{transitionId}/properties`

This will be removed on [June 1, 2026](https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-2570); delete transition properties using [Bulk update workflows](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflows/#api-rest-api-3-workflows-update-post) instead.

Deletes a property from a workflow transition. Transition properties are used to change the behavior of a transition. For more information, see [Transition properties](https://confluence.atlassian.com/x/zIhKLg#Advancedworkflowconfiguration-transitionproperties) and [Workflow properties](https://confluence.atlassian.com/x/JYlKLg).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **transitionId** (path): The ID of the transition. To get the ID, view the workflow in text mode in the Jira admin settings. The ID is shown next to the transition.
- **key** (query): The name of the transition property to delete, also known as the name of the property.
- **workflowName** (query): The name of the workflow that the transition belongs to.
- **workflowMode** (query): The workflow status. Set to `live` for inactive workflows or `draft` for draft workflows. Active workflows cannot be edited.

### Responses

- **200**: 200 response
- **304**: Returned if no changes were made by the request. For example, trying to delete a property that cannot be found.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow transition is not found.

---

## Get workflow transition properties

`GET /rest/api/3/workflow/transitions/{transitionId}/properties`

This will be removed on [June 1, 2026](https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-2570); fetch transition properties from [Bulk get workflows](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflows/#api-rest-api-3-workflows-post) instead.

Returns the properties on a workflow transition. Transition properties are used to change the behavior of a transition. For more information, see [Transition properties](https://confluence.atlassian.com/x/zIhKLg#Advancedworkflowconfiguration-transitionproperties) and [Workflow properties](https://confluence.atlassian.com/x/JYlKLg).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **transitionId** (path): The ID of the transition. To get the ID, view the workflow in text mode in the Jira administration console. The ID is shown next to the transition.
- **includeReservedKeys** (query): Some properties with keys that have the *jira.* prefix are reserved, which means they are not editable. To include these properties in the results, set this parameter to *true*.
- **key** (query): The key of the property being returned, also known as the name of the property. If this parameter is not specified, all properties on the transition are returned.
- **workflowName** (query): The name of the workflow that the transition belongs to.
- **workflowMode** (query): The workflow status. Set to *live* for active and inactive workflows, or *draft* for draft workflows.

### Responses

- **200**: 200 response
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have admin permission
- **404**: Returned if the workflow transition or property is not found.

---

## Create workflow transition property

`POST /rest/api/3/workflow/transitions/{transitionId}/properties`

This will be removed on [June 1, 2026](https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-2570); add transition properties using [Bulk update workflows](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflows/#api-rest-api-3-workflows-update-post) instead.

Adds a property to a workflow transition. Transition properties are used to change the behavior of a transition. For more information, see [Transition properties](https://confluence.atlassian.com/x/zIhKLg#Advancedworkflowconfiguration-transitionproperties) and [Workflow properties](https://confluence.atlassian.com/x/JYlKLg).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **transitionId** (path): The ID of the transition. To get the ID, view the workflow in text mode in the Jira admin settings. The ID is shown next to the transition.
- **key** (query): The key of the property being added, also known as the name of the property. Set this to the same value as the `key` defined in the request body.
- **workflowName** (query): The name of the workflow that the transition belongs to.
- **workflowMode** (query): The workflow status. Set to *live* for inactive workflows or *draft* for draft workflows. Active workflows cannot be edited.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/WorkflowTransitionProperty"
}
```

### Responses

- **200**: 200 response
- **400**: Returned if a workflow property with the same key is present on the transition.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow transition is not found.

---

## Update workflow transition property

`PUT /rest/api/3/workflow/transitions/{transitionId}/properties`

This will be removed on [June 1, 2026](https://developer.atlassian.com/cloud/jira/platform/changelog/#CHANGE-2570); update transition properties using [Bulk update workflows](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflows/#api-rest-api-3-workflows-update-post) instead.

Updates a workflow transition by changing the property value. Trying to update a property that does not exist results in a new property being added to the transition. Transition properties are used to change the behavior of a transition. For more information, see [Transition properties](https://confluence.atlassian.com/x/zIhKLg#Advancedworkflowconfiguration-transitionproperties) and [Workflow properties](https://confluence.atlassian.com/x/JYlKLg).

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **transitionId** (path): The ID of the transition. To get the ID, view the workflow in text mode in the Jira admin settings. The ID is shown next to the transition.
- **key** (query): The key of the property being updated, also known as the name of the property. Set this to the same value as the `key` defined in the request body.
- **workflowName** (query): The name of the workflow that the transition belongs to.
- **workflowMode** (query): The workflow status. Set to `live` for inactive workflows or `draft` for draft workflows. Active workflows cannot be edited.

### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/WorkflowTransitionProperty"
}
```

### Responses

- **200**: 200 response
- **304**: Returned if no changes were made by the request. For example, attempting to update a property with its current value.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if the workflow transition is not found.

---

