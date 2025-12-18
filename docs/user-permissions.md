# User Permissions

User Permissions control access to GTM accounts and containers. They define what actions users can perform and what resources they can access.

## Overview

User Permissions are account-level access controls that determine what users can do within a GTM account. Permissions can be set at the account level and control access to accounts and their containers.

## Resource Path

```
accounts/{account_id}/user_permissions/{permission_id}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountId` | string | GTM Account ID |
| `userPermissionId` | string | Permission ID |
| `emailAddress` | string | Email address of the user |
| `accountAccess` | object | Account-level access permissions |
| `containerAccess` | array | Container-level access permissions |

## Permission Types

### Account Access

- **admin** - Full account access
- **user** - Standard user access
- **noAccess** - No access

### Container Access

- **noAccess** - No access to container
- **read** - Read-only access
- **edit** - Edit access (can modify but not publish)
- **approve** - Approve access (can publish)
- **publish** - Publish access (can publish without approval)

## API Methods

### List User Permissions

Retrieve all user permissions for an account.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/user_permissions`

**Response:**
```json
{
  "userPermission": [
    {
      "accountId": "123456",
      "userPermissionId": "1",
      "emailAddress": "user@example.com",
      "accountAccess": {
        "permission": "admin"
      },
      "containerAccess": [
        {
          "containerId": "7890123",
          "permission": "publish"
        }
      ]
    }
  ]
}
```

### Get User Permission

Retrieve a specific user permission.

**Endpoint:** `GET /tagmanager/v2/accounts/{account_id}/user_permissions/{permission_id}`

**Response:** User Permission object

### Create User Permission

Create a new user permission.

**Endpoint:** `POST /tagmanager/v2/accounts/{account_id}/user_permissions`

**Request Body:**
```json
{
  "emailAddress": "user@example.com",
  "accountAccess": {
    "permission": "user"
  },
  "containerAccess": [
    {
      "containerId": "7890123",
      "permission": "edit"
    }
  ]
}
```

**Response:** Created user permission object

### Update User Permission

Update an existing user permission.

**Endpoint:** `PUT /tagmanager/v2/accounts/{account_id}/user_permissions/{permission_id}`

**Request Body:**
```json
{
  "accountAccess": {
    "permission": "admin"
  },
  "containerAccess": [
    {
      "containerId": "7890123",
      "permission": "publish"
    }
  ]
}
```

**Response:** Updated user permission object

### Delete User Permission

Delete a user permission (revoke access).

**Endpoint:** `DELETE /tagmanager/v2/accounts/{account_id}/user_permissions/{permission_id}`

## Common Use Cases

1. **Grant account access** - Add users to an account
2. **Set container permissions** - Control access to specific containers
3. **Update permissions** - Modify user access levels
4. **Revoke access** - Remove user permissions
5. **List account users** - View all users with access

## Implementation Notes

- Permissions are account-level resources
- Permission IDs are numeric strings
- Email addresses must be valid Google accounts
- Account admins can manage all permissions
- Container permissions override account permissions
- Use `delete` to revoke user access

## Example: Create User Permission

```typescript
const permission = await gtmClient.service.accounts.user_permissions.create({
  parent: 'accounts/123456',
  requestBody: {
    emailAddress: 'user@example.com',
    accountAccess: {
      permission: 'user'
    },
    containerAccess: [
      {
        containerId: '7890123',
        permission: 'edit'
      }
    ]
  }
});
console.log(`Granted access to: ${permission.data.emailAddress}`);
```

## Example: List User Permissions

```typescript
const permissions = await gtmClient.service.accounts.user_permissions.list({
  parent: 'accounts/123456'
});
console.log(`Found ${permissions.data.userPermission?.length || 0} users with access`);
```

