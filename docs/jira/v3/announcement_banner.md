# Announcement banner

This resource represents an announcement banner. Use it to retrieve and update banner configuration.

## Get announcement banner configuration

`GET /rest/api/3/announcementBanner`

Returns the current announcement banner configuration.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Responses

- **200**: Returned if the request is successful.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

## Update announcement banner configuration

`PUT /rest/api/3/announcementBanner`

Updates the announcement banner configuration.

**[Permissions](#permissions) required:** *Administer Jira* [global permission](https://confluence.atlassian.com/x/x4dKLg).

### Parameters


### Request Body

**application/json**

```json
{
  "$ref": "#/components/schemas/AnnouncementBannerConfigurationUpdate"
}
```

### Responses

- **204**: Returned if the request is successful.
- **400**: Returned if an invalid parameter is passed.
- **401**: Returned if the authentication credentials are incorrect or missing.
- **403**: Returned if the user does not have the necessary permission.

---

