# Destinations

Destinations are server-side endpoints in Server-side Tagging that receive processed data from the GTM server. They represent the final endpoints where data is sent after processing.

## Overview

Destinations are used in Server-side Tagging to define where processed data should be sent. They represent third-party endpoints, analytics platforms, or custom destinations that receive data from the GTM server.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/destinations/{destination_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `destinationId` | string | Destination ID |
| `name` | string | Destination display name |
| `destinationType` | string | Destination type |
| `parameter` | array | Destination parameters |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this destination in GTM UI |

## Destination Types

- **Google Analytics 4** - GA4 Measurement Protocol
- **Universal Analytics** - UA Measurement Protocol (legacy)
- **Custom** - Custom HTTP endpoint
- **BigQuery** - Google BigQuery export

## API Methods

### List Destinations

Retrieve all destinations for a container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/destinations`

**Response:**
```json
{
  "destination": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "destinationId": "1",
      "name": "GA4 Destination",
      "destinationType": "GA4_MEASUREMENT_PROTOCOL"
    }
  ]
}
```

### Get Destination

Retrieve a specific destination.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/destinations/{destination_id}`

**Response:** Destination object

### Link Destination

Link a destination to a container (for server-side containers).

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/destinations/{destination_id}:link`

**Request Body:**
```json
{
  "destinationId": "1"
}
```

**Response:** Linked destination object

## Common Use Cases

1. **Configure GA4 destination** - Set up GA4 Measurement Protocol endpoint
2. **Configure custom destinations** - Set up custom HTTP endpoints
3. **Link destinations** - Associate destinations with containers
4. **Manage server-side routing** - Control where server-side data is sent

## Implementation Notes

- Destinations are only used in Server-side Tagging containers
- Destination IDs are numeric strings
- Destinations define where processed data is sent
- Use `link` to associate destinations with containers
- Destinations are container-level, not workspace-level

## Example: List Destinations

```typescript
const destinations = await gtmClient.service.accounts.containers.destinations.list({
  parent: 'accounts/123456/containers/7890123'
});
console.log(`Found ${destinations.data.destination?.length || 0} destinations`);
```

## Example: Link Destination

```typescript
const linked = await gtmClient.service.accounts.containers.destinations.link({
  path: 'accounts/123456/containers/7890123/destinations/1',
  requestBody: {
    destinationId: '1'
  }
});
console.log(`Linked destination: ${linked.data.name}`);
```

