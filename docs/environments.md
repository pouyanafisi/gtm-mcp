# Environments

Environments are deployment configurations for containers. They define different deployment contexts (development, staging, production) and their associated container versions.

## Overview

Environments allow you to deploy different versions of a container to different contexts. This enables testing changes in development/staging before publishing to production.

## Resource Path

```
accounts/{account_id}/containers/{container_id}/environments/{environment_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `containerId` | string | Container ID |
| `environmentId` | string | Environment ID |
| `name` | string | Environment display name |
| `description` | string | Environment description |
| `type` | string | Environment type (user, live, latest) |
| `url` | string | Environment URL (for preview environments) |
| `authorizationCode` | string | Authorization code for the environment |
| `authorizationTimestamp` | string | Timestamp of authorization |
| `fingerprint` | string | Fingerprint for optimistic concurrency control |
| `tagManagerUrl` | string | URL to access this environment in GTM UI |

## Environment Types

- **user** - User-defined environment (development, staging, etc.)
- **live** - Live/production environment
- **latest** - Latest version environment

## API Methods

### List Environments

Retrieve all environments for a container.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/environments`

**Response:**
```json
{
  "environment": [
    {
      "accountId": "123456",
      "containerId": "7890123",
      "environmentId": "1",
      "name": "Default",
      "type": "live",
      "url": "https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"
    }
  ]
}
```

### Get Environment

Retrieve a specific environment.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/containers/{container_id}/environments/{environment_id}`

**Response:** Environment object

### Create Environment

Create a new environment.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/environments`

**Request Body:**
```json
{
  "name": "Development",
  "description": "Development environment",
  "type": "user"
}
```

**Response:** Created environment object

### Update Environment

Update an existing environment.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/containers/{container_id}/environments/{environment_id}`

**Request Body:**
```json
{
  "name": "Updated Environment Name",
  "description": "Updated description"
}
```

**Response:** Updated environment object

### Delete Environment

Delete an environment.

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/containers/{container_id}/environments/{environment_id}`

### Reauthorize Environment

Reauthorize an environment (regenerate authorization code).

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/containers/{container_id}/environments/{environment_id}:reauthorize`

**Response:**
```json
{
  "environment": {
    "environmentId": "1",
    "authorizationCode": "new-auth-code",
    "authorizationTimestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Environment URLs

Each environment has a unique URL that points to a specific container version:

- **Live environment**: Points to the published version
- **User environments**: Points to a specific version or latest
- **Preview environments**: Use authorization codes for testing

## Common Use Cases

1. **Create development environment** - Set up a separate environment for testing
2. **Deploy to staging** - Test changes in staging before production
3. **Preview changes** - Use preview environments to test workspace changes
4. **Manage multiple environments** - Organize deployments across environments

## Implementation Notes

- Environment IDs are numeric strings
- Each container has a default live environment
- Environments can be associated with specific versions
- Preview environments use authorization codes for access control
- Use `reauthorize` to regenerate authorization codes

## Example: List Environments

```typescript
const environments = await gtmClient.service.accounts.containers.environments.list({
  parent: 'accounts/123456/containers/7890123'
});
console.log(`Found ${environments.data.environment?.length || 0} environments`);
```

## Example: Create Development Environment

```typescript
const env = await gtmClient.service.accounts.containers.environments.create({
  parent: 'accounts/123456/containers/7890123',
  requestBody: {
    name: 'Development',
    description: 'Development environment',
    type: 'user'
  }
});
console.log(`Created environment: ${env.data.name}`);
```

