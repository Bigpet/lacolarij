# JQL

This resource represents JQL search auto-complete details. Use it to obtain JQL search auto-complete data and suggestions for use in programmatic construction of queries or custom query builders. It also provides operations to:

 *  convert one or more JQL queries with user identifiers (username or user key) to equivalent JQL queries with account IDs.
 *  convert readable details in one or more JQL queries to IDs where a user doesn't have permission to view the entity whose details are readable.

## Get field reference data (GET)

`GET /rest/api/2/jql/autocompletedata`

Returns reference data for JQL searches. This is a downloadable version of the documentation provided in [Advanced searching - fields reference](https://confluence.atlassian.com/x/gwORLQ) and [Advanced searching - functions reference](https://confluence.atlassian.com/x/hgORLQ), along with a list of JQL-reserved words. Use this information to assist with the programmatic creation of JQL queries or the validation of queries built in a custom query builder.

To filter visible field details by project or collapse non-unique fields by field type then [Get field reference data (POST)](#api-rest-api-2-jql-autocompletedata-post) can be used.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get field reference data (POST)

`POST /rest/api/2/jql/autocompletedata`

Returns reference data for JQL searches. This is a downloadable version of the documentation provided in [Advanced searching - fields reference](https://confluence.atlassian.com/x/gwORLQ) and [Advanced searching - functions reference](https://confluence.atlassian.com/x/hgORLQ), along with a list of JQL-reserved words. Use this information to assist with the programmatic creation of JQL queries or the validation of queries built in a custom query builder.

This operation can filter the custom fields returned by project. Invalid project IDs in `projectIds` are ignored. System fields are always returned.

It can also return the collapsed field for custom fields. Collapsed fields enable searches to be performed across all fields with the same name and of the same field type. For example, the collapsed field `Component - Component[Dropdown]` enables dropdown fields `Component - cf[10061]` and `Component - cf[10062]` to be searched simultaneously.

**[Permissions](#permissions) required:** None.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/SearchAutoCompleteFilter" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Get field auto complete suggestions

`GET /rest/api/2/jql/autocompletedata/suggestions`

Returns the JQL search auto complete suggestions for a field.

Suggestions can be obtained by providing:

 *  `fieldName` to get a list of all values for the field.
 *  `fieldName` and `fieldValue` to get a list of values containing the text in `fieldValue`.
 *  `fieldName` and `predicateName` to get a list of all predicate values for the field.
 *  `fieldName`, `predicateName`, and `predicateValue` to get a list of predicate values containing the text in `predicateValue`.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **fieldName** (query): The name of the field.
- **fieldValue** (query): The partial field item name entered by the user.
- **predicateName** (query): The name of the [ CHANGED operator predicate](https://confluence.atlassian.com/x/hQORLQ#Advancedsearching-operatorsreference-CHANGEDCHANGED) for which the suggestions are generated. The valid predicate operators are *by*, *from*, and *to*.
- **predicateValue** (query): The partial predicate item name entered by the user.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if an invalid combination of parameters is passed.
- **401**: Returned if the authentication credentials are incorrect.

---

## Parse JQL query

`POST /rest/api/2/jql/parse`

Parses and validates JQL queries.

Validation is performed in context of the current user.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **validation** (query): How to validate the JQL query and treat the validation results. Validation options include:

 *  `strict` Returns all errors. If validation fails, the query structure is not returned.
 *  `warn` Returns all errors. If validation fails but the JQL query is correctly formed, the query structure is returned.
 *  `none` No validation is performed. If JQL query is correctly formed, the query structure is returned.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/JqlQueriesToParse" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect.

---

## Convert user identifiers to account IDs in JQL queries

`POST /rest/api/2/jql/pdcleaner`

Converts one or more JQL queries with user identifiers (username or user key) to equivalent JQL queries with account IDs.

You may wish to use this operation if your system stores JQL queries and you want to make them GDPR-compliant. For more information about GDPR-related changes, see the [migration guide](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/).

**[Permissions](#permissions) required:** Permission to access Jira.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/JQLPersonalDataMigrationRequest" }
```

### Responses

- **200**: Returned if the request is successful. Note that the JQL queries are returned in the same order that they were passed.
- **400**: Returned if at least one of the queries cannot be converted. For example, the JQL has invalid operators or invalid keywords, or the users in the query cannot be found.
- **401**: Returned if the authentication credentials are incorrect or missing.

---

## Sanitize JQL queries

`POST /rest/api/2/jql/sanitize`

Sanitizes one or more JQL queries by converting readable details into IDs where a user doesn't have permission to view the entity.

For example, if the query contains the clause *project = 'Secret project'*, and a user does not have browse permission for the project "Secret project", the sanitized query replaces the clause with *project = 12345"* (where 12345 is the ID of the project). If a user has the required permission, the clause is not sanitized. If the account ID is null, sanitizing is performed for an anonymous user.

Note that sanitization doesn't make the queries GDPR-compliant, because it doesn't remove user identifiers (username or user key). If you need to make queries GDPR-compliant, use [Convert user identifiers to account IDs in JQL queries](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-jql/#api-rest-api-3-jql-sanitize-post).

Before sanitization each JQL query is parsed. The queries are returned in the same order that they were passed.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/JqlQueriesToSanitize" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

