# Accounts

Accounts are the top-level organizational units in Google Tag Manager. Each account can contain multiple containers and has associated user permissions.

## Overview

An Account represents a Google Tag Manager account that belongs to a user or organization. Accounts are the root of the GTM hierarchy and contain all other entities.

## Resource Path

```
accounts/{account_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | The Account ID uniquely identifies the GTM Account |
| `name` | string | Account display name |
| `shareData` | boolean | Whether the account shares data anonymously with Google and others |
| `fingerprint` | string | The fingerprint of the GTM Account as computed at storage time |

## API Methods

### List Accounts

Retrieve all accounts accessible to the authenticated user.

**Endpoint:** `GET /tagmanager/v2/accounts`

**Response:**
```json
{
  "account": [
    {
      "accountId": "123456",
      "name": "My Company",
      "shareData": true,
      "fingerprint": "abc123"
    }
  ]
}
```

### Get Account

Retrieve a specific account by ID.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}`

**Parameters:**
- `account_id` (path, required): The GTM Account ID

**Response:**
```json
{
  "accountId": "123456",
  "name": "My Company",
  "shareData": true,
  "fingerprint": "abc123"
}
```

### Update Account

Update an existing account.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}`

**Parameters:**
- `account_id` (path, required): The GTM Account ID

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "shareData": false
}
```

**Response:** Updated account object

## Related Resources

- [Containers](./containers.md) - Containers belong to accounts
- [User Permissions](./user-permissions.md) - Permissions are managed at the account level

## Common Use Cases

1. **List all accounts** - Discover which accounts the user has access to
2. **Get account details** - Retrieve account information for display or configuration
3. **Update account settings** - Modify account name or data sharing preferences

## Implementation Notes

- Account IDs are numeric strings
- Accounts cannot be deleted via the API
- Account names should be descriptive and unique within a user's accessible accounts
- The `fingerprint` field is used for optimistic concurrency control

## Example: List All Accounts

```typescript
const response = await gtmClient.service.accounts.list();
const accounts = response.data.account || [];
console.log(`Found ${accounts.length} accounts`);
```

## Example: Get Account Details

```typescript
const account = await gtmClient.service.accounts.get({
  path: 'accounts/123456'
});
console.log(`Account: ${account.data.name}`);
```

