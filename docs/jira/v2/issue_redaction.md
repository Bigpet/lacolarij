# Issue redaction

This resource represents Issue Redaction. Provides APIs to redact issue data.

## Redact

`POST /rest/api/2/redact`

Submit a job to redact issue field data. This will trigger the redaction of the data in the specified fields asynchronously.

The redaction status can be polled using the job id.

### Parameters


### Request Body

**application/json**

```json
{ "$ref": "#/components/schemas/BulkRedactionRequest" }
```

### Responses

- **202**: Returned if the job submission is successful. The response contains the job id.
- **400**: Returned if the redaction request is invalid.
- **401**: Returned if the user / app is not authorised to redact data
- **403**: Returned if the AGP subscription is not present.

---

## Get redaction status

`GET /rest/api/2/redact/status/{jobId}`

Retrieves the current status of a redaction job ID.

The jobStatus will be one of the following:

 *  IN\_PROGRESS - The redaction job is currently in progress
 *  COMPLETED - The redaction job has completed successfully.
 *  PENDING - The redaction job has not started yet

### Parameters

- **jobId** (path): Redaction job id

### Responses

- **200**: Returned if the job status is successfully retrieved.
- **403**: Returned if the AGP subscription is not present.
- **404**: Returned if the job id is not found.

---

