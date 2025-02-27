# Keycloak Resource Management Guide

This document outlines the various HTTP requests needed to manage resources and permissions in Keycloak.

## Authentication Requests

### Get Master Admin Token (Initial Setup Only)
```bash
curl -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=admin-cli&username=admin&password=admin"
```

### Get Realm Admin Token (Recommended for Regular Use)
```bash
curl -X POST "http://localhost:8080/realms/myrealm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=admin-cli&username=realm-admin&password=realm-admin-password"
```

### Get Client Token
```bash
curl -X POST "http://localhost:8080/realms/myrealm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=nestjs-api&client_secret=Ec9aSczbNjIYyg0zuT4X3td22A0r8xpE"
```

## Resource Management

### List Resources
```bash
curl -X GET "http://localhost:8080/realms/myrealm/authz/protection/resource_set" \
  -H "Authorization: Bearer {access_token}"
```

### Get Resource Details
```bash
curl -X GET "http://localhost:8080/realms/myrealm/authz/protection/resource_set/{resource_id}" \
  -H "Authorization: Bearer {access_token}"
```

### Create New Resource

The recommended approach is to use existing base role policies rather than creating new ones for each resource. There are two base policies that should be reused:

1. admin-policy:
   - ID: 883178c7-3f91-47f2-a934-d0fbd91afdbd
   - Checks for admin role (c50e0e3b-3a76-4d39-aa52-ea37e0ca4ded)
   - Used for granting full CRUD access

2. user-policy:
   - ID: 37034d0b-8e9b-4457-bb63-70203ee83966
   - Checks for user role (be9efd1c-5643-49df-99ce-013ccbc421d0)
   - Used for granting read-only access

Here's how to create a new protected resource:

1. Create the resource:
```bash
curl -X POST "http://localhost:8080/admin/realms/myrealm/clients/8f4a3d66-9008-4de1-8429-2bd088377254/authz/resource-server/resource" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "categories",
    "displayName": "categories",
    "type": "urn:nestjs-api:resources:categories",
    "ownerManagedAccess": false,
    "scopes": [
        { "name": "create" },
        { "name": "read" },
        { "name": "update" },
        { "name": "delete" }
    ]
}'
```

2. Create admin permission using existing admin-policy:
```bash
curl -X POST "http://localhost:8080/admin/realms/myrealm/clients/8f4a3d66-9008-4de1-8429-2bd088377254/authz/resource-server/permission/scope" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin-categories-permission",
    "description": "Admin permission for categories resource",
    "type": "scope",
    "logic": "POSITIVE",
    "decisionStrategy": "AFFIRMATIVE",
    "resources": ["ec59df75-ac8b-4122-8401-12b64d722a6d"],
    "policies": ["admin-policy"],
    "scopes": ["create", "read", "update", "delete"]
}'
```

3. Create user permission using existing user-policy:
```bash
curl -X POST "http://localhost:8080/admin/realms/myrealm/clients/8f4a3d66-9008-4de1-8429-2bd088377254/authz/resource-server/permission/scope" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-categories-permission",
    "description": "User permission for categories resource (read-only)",
    "type": "scope",
    "logic": "POSITIVE",
    "decisionStrategy": "AFFIRMATIVE",
    "resources": ["ec59df75-ac8b-4122-8401-12b64d722a6d"],
    "policies": ["user-policy"],
    "scopes": ["read"]
}'
```

## Verification Requests

### List All Permissions
```bash
curl -X GET "http://localhost:8080/admin/realms/myrealm/clients/8f4a3d66-9008-4de1-8429-2bd088377254/authz/resource-server/permission" \
  -H "Authorization: Bearer {admin_token}"
```

### List All Policies
```bash
curl -X GET "http://localhost:8080/admin/realms/myrealm/clients/8f4a3d66-9008-4de1-8429-2bd088377254/authz/resource-server/policy" \
  -H "Authorization: Bearer {admin_token}"
```

## Notes

- Replace `{access_token}` with client token and `{admin_token}` with realm admin token obtained from authentication requests
- The client ID `8f4a3d66-9008-4de1-8429-2bd088377254` is specific to the nestjs-api client
- Role IDs used in policies:
  - Admin role: `c50e0e3b-3a76-4d39-aa52-ea37e0ca4ded`
  - User role: `be9efd1c-5643-49df-99ce-013ccbc421d0`

## Resource IDs
- invoices: `5ee1e365-23b0-4937-8362-60b99c63ee3e`
- products: `d6516cd7-8914-463e-b11d-8f6876334fb5`
- suppliers: `05e0824a-e6ae-4831-bbb6-c31409437558`
- categories: `ec59df75-ac8b-4122-8401-12b64d722a6d`

## Realm Admin Credentials
For security best practices, use these realm-specific admin credentials instead of master admin:
- Username: realm-admin
- Password: realm-admin-password
- Realm: myrealm
- Permissions: Full administrative access to myrealm only

The realm admin has all necessary permissions to manage resources, policies, and permissions within the myrealm realm, but cannot affect other realms or the master realm. This follows the principle of least privilege.