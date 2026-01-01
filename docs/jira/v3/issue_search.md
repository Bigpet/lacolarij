# Issue search

This resource represents various ways to search for issues. Use it to search for issues with a JQL query and find issues to populate an issue picker.

## Get issue picker suggestions

`GET /rest/api/3/issue/picker`

Returns lists of issues matching a query string. Use this resource to provide auto-completion suggestions when the user is looking for an issue using a word or string.

This operation returns two lists:

 *  `History Search` which includes issues from the user's history of created, edited, or viewed issues that contain the string in the `query` parameter.
 *  `Current Search` which includes issues that match the JQL expression in `currentJQL` and contain the string in the `query` parameter.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **query** (query): A string to match against text fields in the issue such as title, description, or comments.
- **currentJQL** (query): A JQL query defining a list of issues to search for the query term. Note that `username` and `userkey` cannot be used as search terms for this parameter, due to privacy reasons. Use `accountId` instead.
- **currentIssueKey** (query): The key of an issue to exclude from search results. For example, the issue the user is viewing when they perform this query.
- **currentProjectId** (query): The ID of a project that suggested issues must belong to.
- **showSubTasks** (query): Indicate whether to include subtasks in the suggestions list.
- **showSubTaskParent** (query): When `currentIssueKey` is a subtask, whether to include the parent issue in the suggestions if it matches the query.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Check issues against JQL

`POST /rest/api/3/jql/match`

Checks whether one or more issues would be returned by one or more JQL queries.

**[Permissions](#permissions) required:** None, however, issues are only matched against JQL queries where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/IssuesAndJQLQueries"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if `jqls` exceeds the maximum number of JQL queries or `issueIds` exceeds the maximum number of issue IDs.

---

## Currently being removed. Search for issues using JQL (GET)

`GET /rest/api/3/search`

Endpoint is currently being removed. [More details](https://developer.atlassian.com/changelog/#CHANGE-2046)

Searches for issues using [JQL](https://confluence.atlassian.com/x/egORLQ).

If the JQL query expression is too large to be encoded as a query parameter, use the [POST](#api-rest-api-3-search-post) version of this resource.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Issues are included in the response where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **jql** (query): The [JQL](https://confluence.atlassian.com/x/egORLQ) that defines the search. Note:

 *  If no JQL expression is provided, all issues are returned.
 *  `username` and `userkey` cannot be used as search terms due to privacy reasons. Use `accountId` instead.
 *  If a user has hidden their email address in their user profile, partial matches of the email address will not find the user. An exact match is required.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page. To manage page size, Jira may return fewer items per page where a large number of fields or properties are requested. The greatest number of items returned per page is achieved when requesting `id` or `key` only.
- **validateQuery** (query): Determines how to validate the JQL query and treat the validation results. Supported values are:

 *  `strict` Returns a 400 response code if any errors are found, along with a list of all errors (and warnings).
 *  `warn` Returns all errors as warnings.
 *  `none` No validation is performed.
 *  `true` *Deprecated* A legacy synonym for `strict`.
 *  `false` *Deprecated* A legacy synonym for `warn`.

Note: If the JQL is not correctly formed a 400 response code is returned, regardless of the `validateQuery` value.
- **fields** (query): A list of fields to return for each issue, use it to retrieve a subset of fields. This parameter accepts a comma-separated list. Expand options include:

 *  `*all` Returns all fields.
 *  `*navigable` Returns navigable fields.
 *  Any issue field, prefixed with a minus to exclude.

Examples:

 *  `summary,comment` Returns only the summary and comments fields.
 *  `-description` Returns all navigable (default) fields except description.
 *  `*all,-comment` Returns all fields except comments.

This parameter may be specified multiple times. For example, `fields=field1,field2&fields=field3`.

Note: All navigable fields are returned by default. This differs from [GET issue](#api-rest-api-3-issue-issueIdOrKey-get) where the default is all fields.
- **expand** (query): Use [expand](#expansion) to include additional information about issues in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `renderedFields` Returns field values rendered in HTML format.
 *  `names` Returns the display name of each field.
 *  `schema` Returns the schema describing a field type.
 *  `transitions` Returns all possible transitions for the issue.
 *  `operations` Returns all possible operations for the issue.
 *  `editmeta` Returns information about how each field can be edited.
 *  `changelog` Returns a list of recent updates to an issue, sorted by date, starting from the most recent.
 *  `versionedRepresentations` Instead of `fields`, returns `versionedRepresentations` a JSON array containing each version of a field's value, with the highest numbered item representing the most recent version.
- **properties** (query): A list of issue property keys for issue properties to include in the results. This parameter accepts a comma-separated list. Multiple properties can also be provided using an ampersand separated list. For example, `properties=prop1,prop2&properties=prop3`. A maximum of 5 issue property keys can be specified.
- **fieldsByKeys** (query): Reference fields by their key (rather than ID).
- **failFast** (query): Whether to fail the request quickly in case of an error while loading fields for an issue. For `failFast=true`, if one field fails, the entire operation fails. For `failFast=false`, the operation will continue even if a field fails. It will return a valid response, but without values for the failed field(s).

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the JQL query is invalid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Currently being removed. Search for issues using JQL (POST)

`POST /rest/api/3/search`

Endpoint is currently being removed. [More details](https://developer.atlassian.com/changelog/#CHANGE-2046)

Searches for issues using [JQL](https://confluence.atlassian.com/x/egORLQ).

There is a [GET](#api-rest-api-3-search-get) version of this resource that can be used for smaller JQL query expressions.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Issues are included in the response where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/SearchRequestBean"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the JQL query is invalid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Count issues using JQL

`POST /rest/api/3/search/approximate-count`

Provide an estimated count of the issues that match the [JQL](https://confluence.atlassian.com/x/egORLQ). Recent updates might not be immediately visible in the returned output. This endpoint requires JQL to be bounded.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Issues are included in the response where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/JQLCountRequestBean"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the JQL query cannot be parsed.
- **401**: Returned if the authentication credentials are incorrect.

---

## Search for issues using JQL enhanced search (GET)

`GET /rest/api/3/search/jql`

Searches for issues using [JQL](https://confluence.atlassian.com/x/egORLQ). Recent updates might not be immediately visible in the returned search results. If you need [read-after-write](https://developer.atlassian.com/cloud/jira/platform/search-and-reconcile/) consistency, you can utilize the `reconcileIssues` parameter to ensure stronger consistency assurances. This operation can be accessed anonymously.

If the JQL query expression is too large to be encoded as a query parameter, use the [POST](#api-rest-api-3-search-post) version of this resource.

**[Permissions](#permissions) required:** Issues are included in the response where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **jql** (query): A [JQL](https://confluence.atlassian.com/x/egORLQ) expression. For performance reasons, this parameter requires a bounded query. A bounded query is a query with a search restriction.

 *  Example of an unbounded query: `order by key desc`.
 *  Example of a bounded query: `assignee = currentUser() order by key`.

Additionally, `orderBy` clause can contain a maximum of 7 fields.
- **nextPageToken** (query): The token for a page to fetch that is not the first page. The first page has a `nextPageToken` of `null`. Use the `nextPageToken` to fetch the next page of issues.

Note: The `nextPageToken` field is **not included** in the response for the last page, indicating there is no next page.
- **maxResults** (query): The maximum number of items to return per page. To manage page size, API may return fewer items per page where a large number of fields or properties are requested. The greatest number of items returned per page is achieved when requesting `id` or `key` only. It returns max 5000 issues.
- **fields** (query): A list of fields to return for each issue, use it to retrieve a subset of fields. This parameter accepts a comma-separated list. Expand options include:

 *  `*all` Returns all fields.
 *  `*navigable` Returns navigable fields.
 *  `id` Returns only issue IDs.
 *  Any issue field, prefixed with a minus to exclude.

The default is `id`.

Examples:

 *  `summary,comment` Returns only the summary and comments fields only.
 *  `-description` Returns all navigable (default) fields except description.
 *  `*all,-comment` Returns all fields except comments.

Multiple `fields` parameters can be included in a request.

Note: By default, this resource returns IDs only. This differs from [GET issue](#api-rest-api-3-issue-issueIdOrKey-get) where the default is all fields.
- **expand** (query): Use [expand](#expansion) to include additional information about issues in the response. Note that, unlike the majority of instances where `expand` is specified, `expand` is defined as a comma-delimited string of values. The expand options are:

 *  `renderedFields` Returns field values rendered in HTML format.
 *  `names` Returns the display name of each field.
 *  `schema` Returns the schema describing a field type.
 *  `transitions` Returns all possible transitions for the issue.
 *  `operations` Returns all possible operations for the issue.
 *  `editmeta` Returns information about how each field can be edited.
 *  `changelog` Returns a list of recent updates to an issue, sorted by date, starting from the most recent.
 *  `versionedRepresentations` Instead of `fields`, returns `versionedRepresentations` a JSON array containing each version of a field's value, with the highest numbered item representing the most recent version.

Examples: `"names,changelog"` Returns the display name of each field as well as a list of recent updates to an issue.
- **properties** (query): A list of up to 5 issue properties to include in the results. This parameter accepts a comma-separated list.
- **fieldsByKeys** (query): Reference fields by their key (rather than ID). The default is `false`.
- **failFast** (query): Fail this request early if we can't retrieve all field data.
- **reconcileIssues** (query): Strong consistency issue ids to be reconciled with search results. Accepts max 50 ids. This list of ids should be consistent with each paginated request across different pages.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the search request is invalid
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Search for issues using JQL enhanced search (POST)

`POST /rest/api/3/search/jql`

Searches for issues using [JQL](https://confluence.atlassian.com/x/egORLQ). Recent updates might not be immediately visible in the returned search results. If you need [read-after-write](https://developer.atlassian.com/cloud/jira/platform/search-and-reconcile/) consistency, you can utilize the `reconcileIssues` parameter to ensure stronger consistency assurances. This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Issues are included in the response where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the issue.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/SearchAndReconcileRequestBean"
}
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the search request is invalid
- **401**: Returned if the authentication credentials are incorrect or missing.

---

