# Containers

Containers are the primary organizational units within a GTM Account. Each container represents a collection of tags, triggers, variables, and other configuration elements that work together.

## Overview

A Container is a logical grouping of tags, triggers, variables, and other GTM entities. Containers are typically associated with a website, mobile app, or server-side application. Each container has a unique public ID (e.g., `GTM-XXXXXXX`) and a numeric internal ID.

## Resource Path

```
accounts/{account_id}/containers/{container_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `name` | string | Container display name |
| `publicId` | string | Public container ID (e.g., GTM-XXXXXXX) |
| `usageContext` | array | List of usage contexts (web, android, ios, server) |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `domainName` | array | List of domain names associated with the container |
| `timeZoneCountryId` | string | Country ID for timezone |
| `timeZoneId` | string | Timezone ID |
| `notes` | string | Container notes |

## API Methods

### List Containers

Retrieve all containers in an account.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers`

**Parameters:**
- `account_id` (path, required): The GTM Account ID

**Response:**
```json
{
  "container": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "name": "My Website",
      "publicId": "GTM-XXXXXXX",
      "usageContext": ["web"],
      "domainName": ["example.com"],
      "timeZoneCountryId": "US",
      "timeZoneId": "America/New_York"
    }
  ]
}
```

### Get Container

Retrieve a specific container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}`

**Parameters:**
- `account_id` (path, required): The GTM Account ID
- `container_id` (path, required): The Container ID

**Response:** Container object

### Create Container

Create a new container in an account.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers`

**Request Body:**
```json
{
  "name": "New Container",
  "usageContext": ["web"],
  "domainName": ["example.com"],
  "timeZoneCountryId": "US",
  "timeZoneId": "America/New_York"
}
```

**Response:** Created container object

### Update Container

Update an existing container.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}`

**Request Body:**
```json
{
  "name": "Updated Container Name",
  "domainName": ["example.com", "www.example.com"]
}
```

**Response:** Updated container object

### Delete Container

Delete a container.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}`

**Parameters:**
- `account_id` (path, required): The GTM Account ID
- `container_id` (path, required): The Container ID

### Get Container Snippet

Retrieve the JavaScript snippet for a container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}:snippet`

**Response:**
```json
{
  "snippet": "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>"
}
```

### Lookup Container

Look up a container by public ID.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers:lookup`

**Parameters:**
- `account_id` (path, required): The GTM Account ID
- `destinationId` (query, optional): Destination ID for server-side containers
- `publicId` (query, optional): Public container ID (GTM-XXXXXXX)

**Response:** Container object

### Combine Containers

Combine multiple containers (advanced operation).

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers:combine`

### Move Tag ID

Move a tag ID from one container to another.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}:move_tag_id`

## Usage Contexts

Containers can be used in different contexts:

- **web** - Web containers for websites
- **android** - Android app containers
- **ios** - iOS app containers
- **server** - Server-side containers (Server-side Tagging)

## Related Resources

- [Workspaces](./workspaces.md) - Workspaces belong to containers
- [Versions](./container-versions.md) - Published versions of containers
- [Environments](./environments.md) - Deployment environments for containers
- [Destinations](./destinations.md) - Server-side destinations for containers

## Common Use Cases

1. **List containers** - Discover all containers in an account
2. **Get container snippet** - Retrieve the GTM snippet for embedding
3. **Create new container** - Set up a new website or app tracking
4. **Update container settings** - Modify domain names or timezone
5. **Lookup by public ID** - Find container using GTM-XXXXXXX format

## Implementation Notes

- Container IDs are numeric strings (different from public IDs)
- Public IDs follow the format `GTM-XXXXXXX`
- Containers can have multiple usage contexts
- The `fingerprint` field is used for optimistic concurrency control
- Deleting a container is permanent and cannot be undone

## Example: List All Containers

```typescript
const containers = await gtmClient.listContainers('123456');
console.log(`Found ${containers.containers?.length || 0} containers`);
```

## Example: Get Container Snippet

```typescript
const snippet = await gtmClient.service.accounts.containers.snippet({
  path: 'accounts/123456/containers/7890123'
});
console.log(snippet.data.snippet);
```

