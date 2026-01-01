# Issue comments

This resource represents issue comments. Use it to:

 *  get, create, update, and delete a comment from an issue.
 *  get all comments from issue.
 *  get a list of comments by comment ID.

## Get comments by IDs

`POST /rest/api/2/comment/list`

Returns a [paginated](#pagination) list of comments specified by a list of comment IDs.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Comments are returned where the user:

 *  has *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the comment.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the comment has visibility restrictions, belongs to the group or has the role visibility is restricted to.

### Parameters

- **expand** (query): Use [expand](#expansion) to include additional information about comments in the response. This parameter accepts a comma-separated list. Expand options include:

 *  `renderedBody` Returns the comment body rendered in HTML.
 *  `properties` Returns the comment's properties.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/IssueCommentListRequestBean" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request contains more than 1000 IDs or is empty.

---

## Get comments

`GET /rest/api/2/issue/{issueIdOrKey}/comment`

Returns all comments for an issue.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** Comments are included in the response where the user has:

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the comment.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the comment has visibility restrictions, belongs to the group or has the role visibility is role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **startAt** (query): The index of the first item to return in a page of results (page offset).
- **maxResults** (query): The maximum number of items to return per page.
- **orderBy** (query): [Order](#ordering) the results by a field. Accepts *created* to sort comments by their created date.
- **expand** (query): Use [expand](#expansion) to include additional information about comments in the response. This parameter accepts `renderedBody`, which returns the comment body rendered in HTML.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if `orderBy` is set to a value other than *created*.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue is not found or the user does not have permission to view it.

---

## Add comment

`POST /rest/api/2/issue/{issueIdOrKey}/comment`

Adds a comment to an issue.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* and *Add comments* [ project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue containing the comment is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **expand** (query): Use [expand](#expansion) to include additional information about comments in the response. This parameter accepts `renderedBody`, which returns the comment body rendered in HTML.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/Comment" }
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **401**: Returned if the authentication credentials are incorrect.
- **404**: Returned if the issue is not found or the user does not have permission to view it.
- **413**: Returned if the per-issue limit has been breached for one of the following fields:

 *  comments
 *  attachments

---

## Delete comment

`DELETE /rest/api/2/issue/{issueIdOrKey}/comment/{id}`

Deletes a comment.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue containing the comment is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Delete all comments*[ project permission](https://confluence.atlassian.com/x/yodKLg) to delete any comment or *Delete own comments* to delete comment created by the user,
 *  If the comment has visibility restrictions, the user belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **id** (path): The ID of the comment.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the user does not have permission to delete the comment.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue or comment is not found or the user does not have permission to view the issue or comment.
- **405**: Returned if an anonymous call is made to the operation.

---

## Get comment

`GET /rest/api/2/issue/{issueIdOrKey}/comment/{id}`

Returns a comment.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project containing the comment.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  If the comment has visibility restrictions, the user belongs to the group or has the role visibility is restricted to.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **id** (path): The ID of the comment.
- **expand** (query): Use [expand](#expansion) to include additional information about comments in the response. This parameter accepts `renderedBody`, which returns the comment body rendered in HTML.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue or comment is not found or the user does not have permission to view the issue or comment.

---

## Update comment

`PUT /rest/api/2/issue/{issueIdOrKey}/comment/{id}`

Updates a comment.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project that the issue containing the comment is in.
 *  If [issue-level security](https://confluence.atlassian.com/x/J4lKLg) is configured, issue-level security permission to view the issue.
 *  *Edit all comments*[ project permission](https://confluence.atlassian.com/x/yodKLg) to update any comment or *Edit own comments* to update comment created by the user.
 *  If the comment has visibility restrictions, the user belongs to the group or has the role visibility is restricted to.

**WARNING:** Child comments inherit visibility from their parent comment. Attempting to update a child comment's visibility will result in a 400 (Bad Request) error.

### Parameters

- **issueIdOrKey** (path): The ID or key of the issue.
- **id** (path): The ID of the comment.
- **notifyUsers** (query): Whether users are notified when a comment is updated.
- **overrideEditableFlag** (query): Whether screen security is overridden to enable uneditable fields to be edited. Available to Connect app users with the *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg) and Forge apps acting on behalf of users with *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).
- **expand** (query): Use [expand](#expansion) to include additional information about comments in the response. This parameter accepts `renderedBody`, which returns the comment body rendered in HTML.

### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/Comment" }
```

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the user does not have permission to edit the comment or the request is invalid.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the issue or comment is not found or the user does not have permission to view the issue or comment.

---

