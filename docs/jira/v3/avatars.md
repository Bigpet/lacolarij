# Avatars

This resource represents system and custom avatars. Use it to obtain the details of system or custom avatars, add and remove avatars from a project, issue type or priority and obtain avatar images.

## Get system avatars by type

`GET /rest/api/3/avatar/{type}/system`

Returns a list of system avatar details by owner type, where the owner types are issue type, project, user or priority.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **type** (path): The avatar type.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **500**: Returned if an error occurs while retrieving the list of avatars.

---

## Get avatars

`GET /rest/api/3/universal_avatar/type/{type}/owner/{entityId}`

Returns the system and custom avatars for a project, issue type or priority.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  for custom project avatars, *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project the avatar belongs to.
 *  for custom issue type avatars, *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for at least one project the issue type is used in.
 *  for system avatars, none.
 *  for priority avatars, none.

### Parameters

- **type** (path): The avatar type.
- **entityId** (path): The ID of the item the avatar is associated with.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **404**: Returned if the avatar type is invalid, the associated item ID is missing, or the item is not found.

---

## Load avatar

`POST /rest/api/3/universal_avatar/type/{type}/owner/{entityId}`

Loads a custom avatar for a project, issue type or priority.

Specify the avatar's local file location in the body of the request. Also, include the following headers:

 *  `X-Atlassian-Token: no-check` To prevent XSRF protection blocking the request, for more information see [Special Headers](#special-request-headers).
 *  `Content-Type: image/image type` Valid image types are JPEG, GIF, or PNG.

For example:  
`curl --request POST `

`--user email@example.com:<api_token> `

`--header 'X-Atlassian-Token: no-check' `

`--header 'Content-Type: image/< image_type>' `

`--data-binary "<@/path/to/file/with/your/avatar>" `

`--url 'https://your-domain.atlassian.net/rest/api/3/universal_avatar/type/{type}/owner/{entityId}'`

The avatar is cropped to a square. If no crop parameters are specified, the square originates at the top left of the image. The length of the square's sides is set to the smaller of the height or width of the image.

The cropped image is then used to create avatars of 16x16, 24x24, 32x32, and 48x48 in size.

After creating the avatar use:

 *  [Update issue type](#api-rest-api-3-issuetype-id-put) to set it as the issue type's displayed avatar.
 *  [Set project avatar](#api-rest-api-3-project-projectIdOrKey-avatar-put) to set it as the project's displayed avatar.
 *  [Update priority](#api-rest-api-3-priority-id-put) to set it as the priority's displayed avatar.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **type** (path): The avatar type.
- **entityId** (path): The ID of the item the avatar is associated with.
- **x** (query): The X coordinate of the top-left corner of the crop region.
- **y** (query): The Y coordinate of the top-left corner of the crop region.
- **size** (query): The length of each side of the crop region.

### Request Body

***/***

```json
{}
```

### Responses

- **201**: Returned if the request is successful.
- **400**: Returned if:

 *  an image isn't included in the request.
 *  the image type is unsupported.
 *  the crop parameters extend the crop area beyond the edge of the image.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permissions.
- **404**: Returned if the avatar type is invalid, the associated item ID is missing, or the item is not found.

---

## Delete avatar

`DELETE /rest/api/3/universal_avatar/type/{type}/owner/{owningObjectId}/avatar/{id}`

Deletes an avatar from a project, issue type or priority.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters

- **type** (path): The avatar type.
- **owningObjectId** (path): The ID of the item the avatar is associated with.
- **id** (path): The ID of the avatar.

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if the request is invalid.
- **403**: Returned if the user does not have permission to delete the avatar, the avatar is not deletable.
- **404**: Returned if the avatar type, associated item ID, or avatar ID is invalid.

---

## Get avatar image by type

`GET /rest/api/3/universal_avatar/view/type/{type}`

Returns the default project, issue type or priority avatar image.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:** None.

### Parameters

- **type** (path): The icon type of the avatar.
- **size** (query): The size of the avatar image. If not provided the default size is returned.
- **format** (query): The format to return the avatar image in. If not provided the original content format is returned.

### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if an avatar is not found or an avatar matching the requested size is not found.

---

## Get avatar image by ID

`GET /rest/api/3/universal_avatar/view/type/{type}/avatar/{id}`

Returns a project, issue type or priority avatar image by ID.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  For system avatars, none.
 *  For custom project avatars, *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project the avatar belongs to.
 *  For custom issue type avatars, *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for at least one project the issue type is used in.
 *  For priority avatars, none.

### Parameters

- **type** (path): The icon type of the avatar.
- **id** (path): The ID of the avatar.
- **size** (query): The size of the avatar image. If not provided the default size is returned.
- **format** (query): The format to return the avatar image in. If not provided the original content format is returned.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if an avatar is not found or an avatar matching the requested size is not found.

---

## Get avatar image by owner

`GET /rest/api/3/universal_avatar/view/type/{type}/owner/{entityId}`

Returns the avatar image for a project, issue type or priority.

This operation can be accessed anonymously.

**[Permissions](#permissions) required:**

 *  For system avatars, none.
 *  For custom project avatars, *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for the project the avatar belongs to.
 *  For custom issue type avatars, *Browse projects* [project permission](https://confluence.atlassian.com/x/yodKLg) for at least one project the issue type is used in.
 *  For priority avatars, none.

### Parameters

- **type** (path): The icon type of the avatar.
- **entityId** (path): The ID of the project or issue type the avatar belongs to.
- **size** (query): The size of the avatar image. If not provided the default size is returned.
- **format** (query): The format to return the avatar image in. If not provided the original content format is returned.

### Responses

- **200**: Returned if the request is successful.
- **400**: Returned if the request is not valid.
- **401**: Returned if the authentication credentials are incorrect.
- **403**: Returned if the user does not have the necessary permission.
- **404**: Returned if an avatar is not found or an avatar matching the requested size is not found.

---

