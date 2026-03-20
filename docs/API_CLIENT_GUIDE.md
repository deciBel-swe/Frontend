# API Client Guide

This guide explains the centralized API request template used by the frontend.

## Goals

- Keep one place for backend communication.
- Validate every request and response DTO at runtime with Zod.
- Reuse one axios client configured from app config.
- Standardize error shape with ApiErrorDTO.

## Core Files

- src/hooks/useAPI.ts
- src/types/apiContracts.ts
- src/constants/routes.ts
- src/config/index.ts

## Request Lifecycle

1. A caller selects an endpoint contract from API_CONTRACTS.
2. apiRequest validates the request payload (if a request schema exists).
3. axios sends the request through the shared apiClient.
4. apiRequest validates the response payload with the contract response schema.
5. Consumers receive typed, validated data.
6. Errors are normalized to ApiErrorDTO by normalizeApiError.

## Hook Types

### useApiQuery

Use for read operations where caching, stale management, and invalidation matter.

Example:

```ts
const privacyQuery = useApiQuery({
  queryKey: ['privacySettings'],
  endpoint: API_CONTRACTS.USERS_ME_PRIVACY,
});
```

### useApiMutation

Use for write operations that change backend state.

Example:

```ts
const updatePrivacyMutation = useApiMutation({
  endpoint: API_CONTRACTS.USERS_ME_PRIVACY_UPDATE,
});

updatePrivacyMutation.mutate({ isPrivate: true });
```

### useAPI

Use when you need imperative control outside query and mutation wrappers.

Example:

```ts
const { request } = useAPI();
const me = await request(API_CONTRACTS.USERS_ME);
```

## Add a New Endpoint

1. Add URL in API_ENDPOINTS inside src/constants/routes.ts.
2. Define request and response Zod schemas in src/types.
3. Add a typed contract in src/types/apiContracts.ts.
4. Use that contract from a service or hook through useApiQuery, useApiMutation, or apiRequest.

## Contract Example

```ts
export const API_CONTRACTS = {
  USERS_ME: defineContract({
    method: 'GET',
    url: API_ENDPOINTS.USERS.ME,
    responseSchema: userMeSchema,
  }),
} as const;
```

## Common Pitfalls

- Skipping request schema for write endpoints. If you have a DTO, validate it.
- Bypassing API_CONTRACTS and calling URLs directly.
- Returning unvalidated response data from custom axios calls.
- Throwing raw errors from hooks instead of normalizing them.
