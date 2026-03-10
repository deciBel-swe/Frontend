---
title: Decibel API
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Decibel API

API documentation for Decibel. Fully compliant with Phase 1 SRS.

Global API Rules:
- Base URL: `/api`
- All endpoints expect and return `application/json` unless otherwise specified.
- Endpoints marked as secured require a bearer token in the `Authorization` header.

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# Authentication

<a id="opIdcheckUserAvailability"></a>

## POST Check email or profile URL availability

POST /auth/check-user

> Body Parameters

```json
{
  "email": "user@example.com",
  "username": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CheckUserRequest](#schemacheckuserrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "isAvailable": true,
  "message": "Available!"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Availability result|Inline|

### Responses Data Schema

#### Enum

|Name|Value|
|---|---|
|isAvailable|true|
|isAvailable|false|
|errorField|username|
|errorField|email|

<a id="opIdloginLocal"></a>

## POST Login with email and password

POST /auth/login/local

> Body Parameters

```json
{
  "email": "user@example.com",
  "password": "pa$$word",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LoginLocalRequest](#schemaloginlocalrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": 0,
    "username": "string",
    "tier": "FREE",
    "profileUrl": "string",
    "avatarUrl": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login successful|[LoginResponse](#schemaloginresponse)|

<a id="opIdrefreshToken"></a>

## POST Refresh access token

POST /auth/refreshtoken

> Body Parameters

```json
{
  "refreshToken": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RefreshTokenRequest](#schemarefreshtokenrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "accessToken": "string",
  "expiresIn": 0
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tokens refreshed|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» accessToken|string|true|none||none|
|» expiresIn|integer|true|none||none|

<a id="opIdlogout"></a>

## POST Logout current session

POST /auth/logout

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Logged out successfully|None|

<a id="opIdlogoutAll"></a>

## POST Logout current user from all active sessions

POST /auth/logout-all

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Logged out of all devices successfully|None|

<a id="opIdverifyEmail"></a>

## POST Verify email

POST /auth/verify-email

> Body Parameters

```json
{
  "token": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[VerifyEmailRequest](#schemaverifyemailrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Email verified|[MessageResponse](#schemamessageresponse)|

<a id="opIdresendVerification"></a>

## POST Resend verification email

POST /auth/resend-verification

> Body Parameters

```json
{
  "email": "user@example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ForgotPasswordRequest](#schemaforgotpasswordrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Verification email resent|[MessageResponse](#schemamessageresponse)|

<a id="opIdforgotPassword"></a>

## POST Start password recovery

POST /auth/forgot-password

> Body Parameters

```json
{
  "email": "user@example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ForgotPasswordRequest](#schemaforgotpasswordrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Password recovery started|[MessageResponse](#schemamessageresponse)|

<a id="opIdregisterLocal"></a>

## POST Register with email and password

POST /auth/register/local

> Body Parameters

```json
{
  "email": "user@example.com",
  "username": "string",
  "password": "pa$$word",
  "dateOfBirth": "2019-08-24",
  "gender": "string",
  "city": "string",
  "country": "string",
  "captchaToken": "string",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RegisterLocalRequest](#schemaregisterlocalrequest)| yes |none|

> Response Examples

> 201 Response

```json
"User Generated successfully"
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|User registered|string|

<a id="opIdresetPassword"></a>

## POST Reset password using token

POST /auth/reset-password

> Body Parameters

```json
{
  "token": "string",
  "newPassword": "pa$$word"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ResetPasswordRequest](#schemaresetpasswordrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Password reset completed|[MessageResponse](#schemamessageresponse)|

## GET Trigger Google login

GET /oauth2/authorization/google

NOTE You MUST trigger this endpoint by changing the brower window URL not by fetch 

> Body Parameters

```json
{
  "authUrl": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|
|» authUrl|body|string| yes |none|

> Response Examples

> 302 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|302|[Found](https://tools.ietf.org/html/rfc7231#section-6.4.3)|none|Inline|

### Responses Data Schema

### Response Header

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|302|Location|string||none|

## GET Google Callback (Internal)

GET /login/oauth2/code/google

Note for Frontend: You do not call this endpoint. Google calls this automatically after the user logs in.

> Response Examples

> 302 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|302|[Found](https://tools.ietf.org/html/rfc7231#section-6.4.3)|none|Inline|

### Responses Data Schema

### Response Header

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|302|Location|string||none|

## POST exchange oauth token with Decibel

POST /auth/oauth/google

> Body Parameters

```json
"string"
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Google oauth token](#schemagoogle oauth token)| yes |none|

> Response Examples

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": 0,
    "username": "string",
    "tier": "FREE",
    "profileUrl": "string",
    "avatarUrl": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[LoginResponse](#schemaloginresponse)|

# Account Security

<a id="opIdresetLoggedInPassword"></a>

## POST Change logged-in user password

POST /users/me/reset-password

> Body Parameters

```json
{
  "newPassword": "pa$$word"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ResetLoggedInPasswordRequest](#schemaresetloggedinpasswordrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Password updated|[MessageResponse](#schemamessageresponse)|

<a id="opIdaddNewEmail"></a>

## POST Add additional email

POST /users/me/add-new-email

> Body Parameters

```json
{
  "newEmail": "user@example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AddNewEmailRequest](#schemaaddnewemailrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Email added|[MessageResponse](#schemamessageresponse)|

<a id="opIdupdatePrimaryEmail"></a>

## POST Set primary email

POST /users/me/update-email-primary

> Body Parameters

```json
{
  "newEmail": "user@example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdatePrimaryEmailRequest](#schemaupdateprimaryemailrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Primary email updated|[MessageResponse](#schemamessageresponse)|

# Users

<a id="opIdupdateSocialLinks"></a>

## PATCH Update social links

PATCH /users/me/social-links

> Body Parameters

```json
{
  "instagram": "http://example.com",
  "twitter": "http://example.com",
  "website": "http://example.com",
  "supportLink": "http://example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdateSocialLinksRequest](#schemaupdatesociallinksrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "instagram": "http://example.com",
  "website": "http://example.com",
  "supportLink": "http://example.com",
  "twitter": "http://example.com"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Social links updated|[PrivateSocialLinks](#schemaprivatesociallinks)|

## PATCH update user Role

PATCH /users/me/role

> Body Parameters

```json
{
  "newRole": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|
|» newRole|body|string| yes |none|

> Response Examples

> 200 Response

```json
{
  "user": {
    "id": 0,
    "username": "string",
    "tier": "FREE",
    "profileUrl": "string",
    "Role": "LISTENER",
    "email": "string",
    "isVerified": true
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[UserUpdateResponse](#schemauserupdateresponse)|

<a id="opIdgetUserById"></a>

## GET Get public profile by user ID

GET /users/{userId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "username": "string",
  "tier": "ARTIST",
  "profile": {
    "username": "string",
    "id": 0,
    "bio": "string",
    "location": "string",
    "avatarUrl": "http://example.com",
    "coverPhotoUrl": "http://example.com",
    "favoriteGenres": [
      "string"
    ]
  },
  "socialLinks": {
    "instagram": "http://example.com",
    "twitter": "http://example.com",
    "website": "http://example.com"
  },
  "stats": {
    "followersCount": 0,
    "followingCount": 0,
    "trackCount": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Public user profile|[PublicUserProfileResponse](#schemapublicuserprofileresponse)|

<a id="opIdgetMe"></a>

## GET Get current user profile

GET /users/me

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "Role": "LISTENER",
  "email": "user@example.com",
  "username": "string",
  "emailVerified": true,
  "tier": "ARTIST",
  "profile": {
    "bio": "string",
    "location": "string",
    "profilePic": "http://example.com",
    "coverPic": "http://example.com",
    "favoriteGenres": [
      "string"
    ]
  },
  "socialLinks": {
    "instagram": "http://example.com",
    "website": "http://example.com",
    "supportLink": "http://example.com",
    "twitter": "http://example.com"
  },
  "privacySettings": {
    "isPrivate": true,
    "showHistory": true
  },
  "stats": {
    "followers": 0,
    "following": 0,
    "tracksCount": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Current user profile|[MeResponse](#schemameresponse)|

<a id="opIdupdateMe"></a>

## PATCH Update current user profile

PATCH /users/me

> Body Parameters

```json
{
  "bio": "string",
  "city": "string",
  "country": "string",
  "favoriteGenres": [
    "string"
  ],
  "socialLinks": {
    "instagram": "http://example.com",
    "twitter": "http://example.com",
    "website": "http://example.com"
  }
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdateMeRequest](#schemaupdatemerequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "Role": "LISTENER",
  "email": "user@example.com",
  "username": "string",
  "emailVerified": true,
  "tier": "ARTIST",
  "profile": {
    "bio": "string",
    "location": "string",
    "profilePic": "http://example.com",
    "coverPic": "http://example.com",
    "favoriteGenres": [
      "string"
    ]
  },
  "socialLinks": {
    "instagram": "http://example.com",
    "website": "http://example.com",
    "supportLink": "http://example.com",
    "twitter": "http://example.com"
  },
  "privacySettings": {
    "isPrivate": true,
    "showHistory": true
  },
  "stats": {
    "followers": 0,
    "following": 0,
    "tracksCount": 0
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Profile updated|[MeResponse](#schemameresponse)|

<a id="opIdupdatePrivacy"></a>

## PATCH Update privacy settings

PATCH /users/me/privacy

> Body Parameters

```json
{
  "isPrivate": true,
  "showHistory": true
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdatePrivacyRequest](#schemaupdateprivacyrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "isPrivate": true,
  "showHistory": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Privacy updated|[PrivacySettings](#schemaprivacysettings)|

<a id="opIdupdateTier"></a>

## PATCH Update account tier

PATCH /users/me/tier

> Body Parameters

```json
{
  "newTier": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdateTierRequest](#schemaupdatetierrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "tier": "string",
  "login": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": 0,
      "username": "string",
      "tier": "FREE",
      "profileUrl": "string",
      "avatarUrl": "string"
    }
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Tier updated|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» tier|string|true|none||none|
|» login|[LoginResponse](#schemaloginresponse)|true|none||none|
|»» accessToken|string|true|none||none|
|»» refreshToken|string|true|none||none|
|»» user|object|true|none||none|
|»»» id|integer|true|none||none|
|»»» username|string|true|none||none|
|»»» tier|[UserInfo](#schemauserinfo)|true|none||none|
|»»» profileUrl|string|false|none||none|
|»»» avatarUrl|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|tier|FREE|
|tier|ARTIST|
|tier|ARTIST_PRO|

<a id="opIdupdateImages"></a>

## PATCH Update profile or cover images

PATCH /users/me/images

> Body Parameters

```json
{
  "profilePic": "http://example.com",
  "coverPic": "http://example.com"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UpdateImagesJsonRequest](#schemaupdateimagesjsonrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "profilePic": "http://example.com",
  "coverPic": "http://example.com"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Images updated|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» profilePic|string(uri)|false|none||none|
|» coverPic|string(uri)|false|none||none|

<a id="opIdgetHistory"></a>

## GET Get user listening history

GET /users/me/history

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Listening history retrieved|[PaginatedFeedResponse](#schemapaginatedfeedresponse)|

<a id="opIdgetSuggestedUsers"></a>

## GET Get suggested users to follow

GET /users/suggested

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
[
  {
    "id": 0,
    "username": "string"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Suggested users retrieved|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[SearchUser](#schemasearchuser)]|false|none||none|
|» id|integer|false|none||none|
|» username|string|false|none||none|

<a id="opIdgetUserTracks"></a>

## GET Get all tracks uploaded by a user

GET /users/{userId}/tracks

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User tracks retrieved|[PaginatedFeedResponse](#schemapaginatedfeedresponse)|

<a id="opIdgetUserPlaylists"></a>

## GET Get all public playlists created by a user

GET /users/{userId}/playlists

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
[
  {
    "id": 0,
    "title": "string"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User playlists retrieved|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[SearchPlaylist](#schemasearchplaylist)]|false|none||none|
|» id|integer|false|none||none|
|» title|string|false|none||none|

# Followers

<a id="opIdfollowUser"></a>

## POST Follow a user

POST /users/{userId}/follow

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "string",
  "isFollowing": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Follow status updated|[FollowResponse](#schemafollowresponse)|

<a id="opIdunfollowUser"></a>

## DELETE Unfollow a user

DELETE /users/{userId}/follow

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|

> Response Examples

> 200 Response

```json
{
  "message": "string",
  "isFollowing": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Follow status updated|[FollowResponse](#schemafollowresponse)|

<a id="opIdgetFollowers"></a>

## GET Get followers

GET /users/{userId}/followers

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com",
      "tier": "string",
      "isFollowing": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paginated followers list|[PaginatedFollowersResponse](#schemapaginatedfollowersresponse)|

<a id="opIdgetFollowing"></a>

## GET Get following

GET /users/{userId}/following

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com",
      "tier": "string",
      "isFollowing": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paginated following list|[PaginatedFollowersResponse](#schemapaginatedfollowersresponse)|

# Block

<a id="opIdunblockUser"></a>

## DELETE Unblock a user

DELETE /users/{userId}/block

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User unblocked successfully|[MessageResponse](#schemamessageresponse)|

<a id="opIdblockUser"></a>

## POST Block a user

POST /users/{userId}/block

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User blocked successfully|[MessageResponse](#schemamessageresponse)|

<a id="opIdgetBlockedUsers"></a>

## GET Get list of blocked users

GET /users/me/blocked

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com",
      "tier": "string",
      "isFollowing": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Blocked users list retrieved|[PaginatedFollowersResponse](#schemapaginatedfollowersresponse)|

# Tracks

<a id="opIdgetTrackById"></a>

## GET Get track metadata

GET /tracks/{trackId}

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "title": "string",
  "artist": {
    "id": 0,
    "username": "string"
  },
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "waveformUrl": "http://example.com",
  "genre": "string",
  "tags": [
    "string"
  ],
  "state": "PROCESSING",
  "releaseDate": "2019-08-24",
  "playCount": 0,
  "likeCount": 0,
  "repostCount": 0,
  "createdAt": "2019-08-24T14:15:22Z"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track details|[TrackResponse](#schematrackresponse)|

<a id="opIdgetGenres"></a>

## GET Get genres

GET /genres

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "type": "array",
  "items": {
    "type": "string"
  },
  "example": [
    "Pop",
    "Rock",
    "Jazz"
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track details|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|none|None|

### Responses Data Schema

HTTP Status Code **200**

*Genres*

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|

<a id="opIdgetStatusByID"></a>

## GET Get track status

GET /tracks/{trackId}/status

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|string| yes |none|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
"UPLOADING"
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track details|[Status](#schemastatus)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|None|

## GET TrackPeaksDTO

GET /tracks/{trackId}/peaks

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|string| yes |none|

> Response Examples

> 200 Response

```json
{
  "trackId": 0,
  "duration": 0,
  "peaks": [
    0
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[TrackPeaksDTO](#schematrackpeaksdto)|

## POST publishTrack

POST /tracks/{trackId}/publish

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|string| yes |none|
|body|body|object| yes |none|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "permalink": "string",
  "publishedAt": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[publishTrackResponse](#schemapublishtrackresponse)|

## GET getSecretLink

GET /tracks/{trackId}/secret-link

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|string| yes |none|

> Response Examples

> 200 Response

```json
{
  "secretLink": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» secretLink|string|true|none||none|

<a id="opIduploadTrack"></a>

## POST Upload a new track

POST /tracks/upload

> Body Parameters

```yaml
audioFile: ""
coverImage: ""
title: ""
genre: ""
description: ""
isPrivate: ""
waveForm:
  - Floats

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|
|» audioFile|body|string(binary)| yes |Audio file in mp3 or wav format|
|» coverImage|body|string(binary)| no |Optional cover image in jpg or png format|
|» title|body|string| yes |none|
|» genre|body|string| yes |none|
|» description|body|string| no |none|
|» isPrivate|body|boolean| yes |none|
|» waveForm|body|[string]| yes |none|

> Response Examples

> 201 Response

```json
{
  "id": 0,
  "title": "string",
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "durationSeconds": 0
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Track uploaded|[TrackUploadResponse](#schematrackuploadresponse)|

<a id="opIdupdateTrack"></a>

## PUT Update track metadata

PUT /tracks/{trackId}

> Body Parameters

```json
{
  "title": "string",
  "genre": "string",
  "tags": [
    "string"
  ],
  "releaseDate": "2019-08-24",
  "description": "string",
  "isPrivate": true
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|body|body|[UpdateTrackRequest](#schemaupdatetrackrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "title": "string",
  "artist": {
    "id": 0,
    "username": "string"
  },
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "waveformUrl": "http://example.com",
  "genre": "string",
  "tags": [
    "string"
  ],
  "state": "PROCESSING",
  "releaseDate": "2019-08-24",
  "playCount": 0,
  "likeCount": 0,
  "repostCount": 0,
  "createdAt": "2019-08-24T14:15:22Z"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track updated|[TrackResponse](#schematrackresponse)|

<a id="opIddeleteTrack"></a>

## DELETE Delete a track

DELETE /tracks/{trackId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Track deleted|None|

<a id="opIdplayTrack"></a>

## POST Increment play count

POST /tracks/{trackId}/play

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Play recorded|[MessageResponse](#schemamessageresponse)|

<a id="opIdcompleteTrackListen"></a>

## POST Mark a track as completely listened to

POST /tracks/{trackId}/complete

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Full listen recorded|[MessageResponse](#schemamessageresponse)|

<a id="opIddownloadTrack"></a>

## GET Mock offline download for Pro users

GET /tracks/{trackId}/download

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Returns mock audio file binary|None|

# Moderation

<a id="opIdreportTrack"></a>

## POST Report a track

POST /tracks/{trackId}/report

> Body Parameters

```json
{
  "reason": "string",
  "description": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|body|body|[ReportRequest](#schemareportrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Report submitted|[MessageResponse](#schemamessageresponse)|

<a id="opIdreportComment"></a>

## POST Report a comment

POST /comments/{commentId}/report

> Body Parameters

```json
{
  "reason": "string",
  "description": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|commentId|path|integer| yes |Comment ID|
|body|body|[ReportRequest](#schemareportrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Report submitted|[MessageResponse](#schemamessageresponse)|

<a id="opIdlistReports"></a>

## GET View a list of reports (Admin only)

GET /admin/reports

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
[
  {
    "id": 0,
    "reporterId": 0,
    "targetType": "string",
    "status": "string",
    "createdAt": "2019-08-24T14:15:22Z"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|List of reports retrieved|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[ReportResponse](#schemareportresponse)]|false|none||none|
|» id|integer|false|none||none|
|» reporterId|integer|false|none||none|
|» targetType|string|false|none||none|
|» status|string|false|none||none|
|» createdAt|string(date-time)|false|none||none|

<a id="opIdgetReport"></a>

## GET View a specific report (Admin only)

GET /admin/reports/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer| yes |Report ID|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "reporterId": 0,
  "targetType": "string",
  "status": "string",
  "createdAt": "2019-08-24T14:15:22Z"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Report details retrieved|[ReportResponse](#schemareportresponse)|

<a id="opIdupdateReportStatus"></a>

## PUT Update report status (Admin only)

PUT /admin/reports/{id}

> Body Parameters

```json
{
  "status": "OPEN"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer| yes |Report ID|
|body|body|[UpdateReportRequest](#schemaupdatereportrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Report updated|[MessageResponse](#schemamessageresponse)|

<a id="opIdsuspendUser"></a>

## PUT Suspend a user account (Admin only)

PUT /admin/users/{userId}/suspend

> Body Parameters

```json
{
  "durationDays": 0,
  "reason": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|body|body|[SuspendUserRequest](#schemasuspenduserrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User suspended|[MessageResponse](#schemamessageresponse)|

<a id="opIdgetPlatformAnalytics"></a>

## GET Get platform wide metrics (Admin only)

GET /admin/analytics

> Response Examples

> 200 Response

```json
{
  "totalUsers": 0,
  "artistToListenerRatio": "string",
  "totalTracks": 0,
  "totalPlays": 0,
  "playThroughRate": 0,
  "totalStorageUsedBytes": 0
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Platform metrics retrieved|[AnalyticsResponse](#schemaanalyticsresponse)|

# Playlists

<a id="opIdgetPlaylistById"></a>

## GET Get playlist with tracks

GET /playlists/{playlistId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "title": "string",
  "type": "PLAYLIST",
  "owner": {
    "id": 0,
    "username": "string"
  },
  "tracks": [
    {
      "trackId": 0,
      "title": "string",
      "durationSeconds": 0,
      "trackUrl": "http://example.com"
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Playlist details|[PlaylistResponse](#schemaplaylistresponse)|

<a id="opIdcreatePlaylist"></a>

## POST Create playlist or album

POST /playlists

> Body Parameters

```json
{
  "title": "string",
  "description": "string",
  "type": "PLAYLIST",
  "isPrivate": true
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CreatePlaylistRequest](#schemacreateplaylistrequest)| yes |none|

> Response Examples

> 201 Response

```json
{
  "id": 0,
  "title": "string",
  "type": "PLAYLIST",
  "owner": {
    "id": 0,
    "username": "string"
  },
  "tracks": [
    {
      "trackId": 0,
      "title": "string",
      "durationSeconds": 0,
      "trackUrl": "http://example.com"
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Playlist created|[PlaylistResponse](#schemaplaylistresponse)|

<a id="opIdupdatePlaylist"></a>

## PUT Update playlist metadata

PUT /playlists/{playlistId}

> Body Parameters

```json
{
  "title": "string",
  "description": "string",
  "type": "PLAYLIST",
  "isPrivate": true
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|
|body|body|[CreatePlaylistRequest](#schemacreateplaylistrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "title": "string",
  "type": "PLAYLIST",
  "owner": {
    "id": 0,
    "username": "string"
  },
  "tracks": [
    {
      "trackId": 0,
      "title": "string",
      "durationSeconds": 0,
      "trackUrl": "http://example.com"
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Playlist updated|[PlaylistResponse](#schemaplaylistresponse)|

<a id="opIddeletePlaylist"></a>

## DELETE Delete a playlist

DELETE /playlists/{playlistId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Playlist deleted|None|

<a id="opIdaddTrackToPlaylist"></a>

## POST Add track to playlist

POST /playlists/{playlistId}/tracks

> Body Parameters

```json
{
  "trackId": 0
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|
|body|body|[AddTrackToPlaylistRequest](#schemaaddtracktoplaylistrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track added to playlist|[MessageResponse](#schemamessageresponse)|

<a id="opIdreorderPlaylistTracks"></a>

## PUT Reorder tracks inside a playlist

PUT /playlists/{playlistId}/tracks/reorder

> Body Parameters

```json
{
  "trackIds": [
    0
  ]
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|
|body|body|[ReorderTracksRequest](#schemareordertracksrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "id": 0,
  "title": "string",
  "type": "PLAYLIST",
  "owner": {
    "id": 0,
    "username": "string"
  },
  "tracks": [
    {
      "trackId": 0,
      "title": "string",
      "durationSeconds": 0,
      "trackUrl": "http://example.com"
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Playlist tracks reordered|[PlaylistResponse](#schemaplaylistresponse)|

<a id="opIdgetPlaylistSecretLink"></a>

## GET Get playlist secret link

GET /playlists/{playlistId}/secret-link

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|

> Response Examples

> 200 Response

```json
{
  "SecretLink": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Secret link returned|[SecretLinkResponse](#schemasecretlinkresponse)|

<a id="opIdgetPlaylistEmbed"></a>

## GET Get HTML iframe embed code for a playlist

GET /playlists/{playlistId}/embed

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|

> Response Examples

> 200 Response

```json
{
  "embedCode": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Returns HTML embed snippet|[EmbedResponse](#schemaembedresponse)|

<a id="opIdremoveTrackFromPlaylist"></a>

## DELETE Remove track from playlist

DELETE /playlists/{playlistId}/tracks/{trackId}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|playlistId|path|integer| yes |Playlist ID|
|trackId|path|integer| yes |Track ID|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Track removed from playlist|None|

# Engagement

<a id="opIdlikeTrack"></a>

## POST Like a track

POST /tracks/{trackId}/like

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|

> Response Examples

> 200 Response

```json
{
  "message": "string",
  "isLiked": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track liked|[LikeResponse](#schemalikeresponse)|

<a id="opIdunlikeTrack"></a>

## DELETE Remove like from a track

DELETE /tracks/{trackId}/like

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|

> Response Examples

> 200 Response

```json
{
  "message": "string",
  "isLiked": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Like removed|[LikeResponse](#schemalikeresponse)|

<a id="opIdgetTrackLikers"></a>

## GET Get users who liked a track

GET /tracks/{trackId}/likers

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com",
      "tier": "string",
      "isFollowing": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paginated users|[PaginatedFollowersResponse](#schemapaginatedfollowersresponse)|

<a id="opIdrepostTrack"></a>

## POST Repost a track

POST /tracks/{trackId}/repost

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|

> Response Examples

> 200 Response

```json
{
  "message": "string",
  "isReposted": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Track reposted|[RepostResponse](#schemarepostresponse)|

<a id="opIdunrepostTrack"></a>

## DELETE Remove a repost

DELETE /tracks/{trackId}/repost

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|

> Response Examples

> 200 Response

```json
{
  "message": "string",
  "isReposted": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Repost removed|[RepostResponse](#schemarepostresponse)|

<a id="opIdgetTrackReposters"></a>

## GET Get users who reposted a track

GET /tracks/{trackId}/reposters

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com",
      "tier": "string",
      "isFollowing": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paginated users|[PaginatedFollowersResponse](#schemapaginatedfollowersresponse)|

<a id="opIdcreateComment"></a>

## POST Add a comment to a track

POST /tracks/{trackId}/comments

> Body Parameters

```json
{
  "body": "string",
  "timestampSeconds": 0
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|body|body|[CreateCommentRequest](#schemacreatecommentrequest)| yes |none|

> Response Examples

> 201 Response

```json
{
  "id": 0,
  "user": {
    "id": 0,
    "username": "string",
    "avatarUrl": "http://example.com"
  },
  "body": "string",
  "timestampSeconds": 0,
  "replyToCommentId": 0,
  "createdAt": "2019-08-24T14:15:22Z"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Comment created|[Comment](#schemacomment)|

<a id="opIdgetTrackComments"></a>

## GET Get comments for a track

GET /tracks/{trackId}/comments

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|trackId|path|integer| yes |Track ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "user": {
        "id": 0,
        "username": "string",
        "avatarUrl": "http://example.com"
      },
      "body": "string",
      "timestampSeconds": 0,
      "replyToCommentId": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paginated comments|[PaginatedCommentsResponse](#schemapaginatedcommentsresponse)|

# Discovery

<a id="opIdgetFeed"></a>

## GET Get followed users feed

GET /feed

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paginated feed|[PaginatedFeedResponse](#schemapaginatedfeedresponse)|

<a id="opIdgetTrendingTracks"></a>

## GET Get trending tracks

GET /explore/trending

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|genre|query|string| no |none|
|limit|query|integer| no |none|

> Response Examples

> 200 Response

```json
[
  {
    "id": 0,
    "title": "string",
    "artist": {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com"
    },
    "trackUrl": "http://example.com",
    "coverUrl": "http://example.com",
    "genre": "string",
    "playCount": 0,
    "likeCount": 0
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Trending tracks|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|*anonymous*|[[TrendingTrack](#schematrendingtrack)]|false|none||none|
|» id|integer|false|none||none|
|» title|string|false|none||none|
|» artist|[TrackArtistWithAvatar](#schematrackartistwithavatar)|false|none||none|
|»» id|integer|false|none||none|
|»» username|string|false|none||none|
|»» avatarUrl|string(uri)|false|none||none|
|» trackUrl|string(uri)|false|none||none|
|» coverUrl|string(uri)|false|none||none|
|» genre|string|false|none||none|
|» playCount|integer|false|none||none|
|» likeCount|integer|false|none||none|

<a id="opIdglobalSearch"></a>

## GET Global search

GET /search

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|q|query|string| yes |none|
|type|query|[SearchType](#schemasearchtype)| no |none|
|page|query|integer| no |none|
|size|query|integer| no |none|

#### Enum

|Name|Value|
|---|---|
|type|ALL|
|type|USERS|
|type|TRACKS|
|type|PLAYLISTS|

> Response Examples

> 200 Response

```json
{
  "users": [
    {
      "id": 0,
      "username": "string"
    }
  ],
  "tracks": [
    {
      "id": 0,
      "title": "string"
    }
  ],
  "playlists": [
    {
      "id": 0,
      "title": "string"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Search results|[SearchResponse](#schemasearchresponse)|

<a id="opIdresolvePermalink"></a>

## GET Resolve a public permalink URL to an internal entity ID

GET /resolve

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|url|query|string| yes |none|

> Response Examples

> 200 Response

```json
{
  "resourceId": 0,
  "resourceType": "USER"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Resolved entity data|[ResourceResolutionResponse](#schemaresourceresolutionresponse)|

<a id="opIdgetGenreStation"></a>

## GET Generate a radio station based on a genre

GET /stations/genre

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|genre|query|string| yes |none|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Radio feed generated|[PaginatedFeedResponse](#schemapaginatedfeedresponse)|

<a id="opIdgetArtistStation"></a>

## GET Generate a radio station based on artist similarities

GET /stations/artist

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|artistId|query|integer| yes |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Radio feed generated|[PaginatedFeedResponse](#schemapaginatedfeedresponse)|

<a id="opIdgetLikesStation"></a>

## GET Generate a radio station based on user's likes

GET /stations/likes

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Radio feed generated|[PaginatedFeedResponse](#schemapaginatedfeedresponse)|

# Conversations

<a id="opIdgetConversations"></a>

## GET Get user's direct messages threads

GET /conversations

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "user1": {
        "id": 0,
        "username": "string"
      },
      "user2": {
        "id": 0,
        "username": "string"
      },
      "unreadCount": 0,
      "lastMessageAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Retrieved list of conversations|[PaginatedConversationsResponse](#schemapaginatedconversationsresponse)|

<a id="opIdstartConversation"></a>

## POST Start a new DM thread

POST /conversations/{userId}/start

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|userId|path|integer| yes |User ID|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

> Response Examples

> 201 Response

```json
{
  "conversationId": 0
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Conversation started|[ConversationCreatedResponse](#schemaconversationcreatedresponse)|

<a id="opIdgetMessages"></a>

## GET Get messages within a conversation thread

GET /conversations/{id}/messages

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer| yes |Conversation ID|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "conversationId": 0,
      "senderId": 0,
      "content": "string",
      "resourceType": "TRACK",
      "resourceId": 0,
      "createdAt": "2019-08-24T14:15:22Z",
      "isRead": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Retrieved messages|[PaginatedMessagesResponse](#schemapaginatedmessagesresponse)|

<a id="opIdsendMessage"></a>

## POST Send a message in a conversation

POST /conversations/{id}/messages

> Body Parameters

```json
{
  "body": "string",
  "resourceType": "TRACK",
  "resourceId": 0
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer| yes |Conversation ID|
|body|body|[CreateMessageRequest](#schemacreatemessagerequest)| yes |none|

> Response Examples

> 201 Response

```json
{
  "id": 0,
  "conversationId": 0,
  "senderId": 0,
  "content": "string",
  "resourceType": "TRACK",
  "resourceId": 0,
  "createdAt": "2019-08-24T14:15:22Z",
  "isRead": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Message sent|[MessageObject](#schemamessageobject)|

# Notifications

<a id="opIdgetNotifications"></a>

## GET Get user notifications

GET /notifications

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|integer| no |none|
|size|query|integer| no |none|

> Response Examples

> 200 Response

```json
{
  "content": [
    {
      "id": 0,
      "type": "string",
      "actor": {
        "id": 0,
        "username": "string"
      },
      "entityId": 0,
      "isRead": true,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Notifications retrieved|[PaginatedNotificationsResponse](#schemapaginatednotificationsresponse)|

<a id="opIdmarkNotificationsRead"></a>

## POST Mark all unread notifications as read

POST /notifications/mark-all-read

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[EmptyObject](#schemaemptyobject)| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Notifications marked read|[MessageResponse](#schemamessageresponse)|

<a id="opIdgetNotificationSettings"></a>

## GET Get user notification preferences

GET /notifications/settings

> Response Examples

> 200 Response

```json
{
  "notifyOnFollow": true,
  "notifyOnLike": true,
  "notifyOnRepost": true,
  "notifyOnComment": true,
  "notifyOnDM": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Preferences retrieved|[NotificationSettings](#schemanotificationsettings)|

<a id="opIdupdateNotificationSettings"></a>

## PUT Update notification preferences

PUT /notifications/settings

> Body Parameters

```json
{
  "notifyOnFollow": true,
  "notifyOnLike": true,
  "notifyOnRepost": true,
  "notifyOnComment": true,
  "notifyOnDM": true
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[NotificationSettings](#schemanotificationsettings)| yes |none|

> Response Examples

> 200 Response

```json
{
  "notifyOnFollow": true,
  "notifyOnLike": true,
  "notifyOnRepost": true,
  "notifyOnComment": true,
  "notifyOnDM": true
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Preferences updated|[NotificationSettings](#schemanotificationsettings)|

<a id="opIdgetUnreadNotificationCount"></a>

## GET Get quick badge unread count for UI

GET /notifications/unread-count

> Response Examples

> 200 Response

```json
{
  "unreadCount": 0
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Unread count|[UnreadCountResponse](#schemaunreadcountresponse)|

<a id="opIdregisterDeviceToken"></a>

## POST Register mobile device token for push notifications

POST /users/me/device-tokens

> Body Parameters

```json
{
  "token": "string",
  "deviceType": "DESKTOP"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[DeviceTokenRequest](#schemadevicetokenrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "message": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Device registered successfully|[MessageResponse](#schemamessageresponse)|

# Subscriptions

<a id="opIdcreateStripeCheckout"></a>

## POST Initiate a Stripe checkout session

POST /subscriptions/checkout

> Body Parameters

```json
{
  "tier": "ARTIST"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CheckoutRequest](#schemacheckoutrequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "checkoutUrl": "http://example.com"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Checkout URL returned|[CheckoutResponse](#schemacheckoutresponse)|

<a id="opIdstripeWebhook"></a>

## POST Stripe webhook listener

POST /subscriptions/webhook

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Webhook received successfully|None|

# deprecated

<a id="opIdloginGoogle"></a>

## POST Login with Google

POST /auth/login/google

> Body Parameters

```json
{
  "accessToken": "string",
  "idToken": "string",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LoginGoogleRequest](#schemalogingooglerequest)| yes |none|

> Response Examples

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": 0,
    "username": "string",
    "tier": "FREE",
    "profileUrl": "string",
    "avatarUrl": "string"
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login successful|[LoginResponse](#schemaloginresponse)|

<a id="opIdregisterGoogle"></a>

## POST Register with Google

POST /auth/register/google

> Body Parameters

```json
{
  "idToken": "string",
  "username": "string",
  "city": "string",
  "country": "string",
  "captchaToken": "string",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[RegisterGoogleRequest](#schemaregistergooglerequest)| yes |none|

> Response Examples

> 201 Response

```json
"User Generated successfully"
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|User registered|string|

# Data Schema

<h2 id="tocS_Status">Status</h2>

<a id="schemastatus"></a>
<a id="schema_Status"></a>
<a id="tocSstatus"></a>
<a id="tocsstatus"></a>

```json
"UPLOADING"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|UPLOADING|
|*anonymous*|PROCESSING|
|*anonymous*|FINISHED|
|*anonymous*|FAILED|

<h2 id="tocS_Google oauth token">Google oauth token</h2>

<a id="schemagoogle oauth token"></a>
<a id="schema_Google oauth token"></a>
<a id="tocSgoogle oauth token"></a>
<a id="tocsgoogle oauth token"></a>

```json
"string"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

<h2 id="tocS_UserUpdateResponse">UserUpdateResponse</h2>

<a id="schemauserupdateresponse"></a>
<a id="schema_UserUpdateResponse"></a>
<a id="tocSuserupdateresponse"></a>
<a id="tocsuserupdateresponse"></a>

```json
{
  "user": {
    "id": 0,
    "username": "string",
    "tier": "FREE",
    "profileUrl": "string",
    "Role": "LISTENER",
    "email": "string",
    "isVerified": true
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|user|object|true|none||none|
|» id|integer|true|none||none|
|» username|string|true|none||none|
|» tier|[UserInfo](#schemauserinfo)|true|none||none|
|» profileUrl|string|false|none||none|
|» Role|string|true|none||none|
|» email|string|true|none||none|
|» isVerified|boolean|true|none||none|

#### Enum

|Name|Value|
|---|---|
|Role|LISTENER|
|Role|ARTIST|

<h2 id="tocS_Untitled Schema">Untitled Schema</h2>

<a id="schemauntitled schema"></a>
<a id="schema_Untitled Schema"></a>
<a id="tocSuntitled schema"></a>
<a id="tocsuntitled schema"></a>

```json
{
  "followerCount": 0,
  "followingCount": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|followerCount|integer|true|none||none|
|followingCount|integer|true|none||none|

<h2 id="tocS_TrackPeaksDTO">TrackPeaksDTO</h2>

<a id="schematrackpeaksdto"></a>
<a id="schema_TrackPeaksDTO"></a>
<a id="tocStrackpeaksdto"></a>
<a id="tocstrackpeaksdto"></a>

```json
{
  "trackId": 0,
  "duration": 0,
  "peaks": [
    0
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|trackId|integer|true|none||none|
|duration|integer|true|none||none|
|peaks|[number]|true|none||none|

<h2 id="tocS_publishTrackResponse">publishTrackResponse</h2>

<a id="schemapublishtrackresponse"></a>
<a id="schema_publishTrackResponse"></a>
<a id="tocSpublishtrackresponse"></a>
<a id="tocspublishtrackresponse"></a>

```json
{
  "id": 0,
  "permalink": "string",
  "publishedAt": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|true|none||none|
|permalink|string|true|none||none|
|publishedAt|string|true|none||none|

<h2 id="tocS_ErrorResponse">ErrorResponse</h2>

<a id="schemaerrorresponse"></a>
<a id="schema_ErrorResponse"></a>
<a id="tocSerrorresponse"></a>
<a id="tocserrorresponse"></a>

```json
{
  "message": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|message|string|false|none||none|

<h2 id="tocS_EmptyObject">EmptyObject</h2>

<a id="schemaemptyobject"></a>
<a id="schema_EmptyObject"></a>
<a id="tocSemptyobject"></a>
<a id="tocsemptyobject"></a>

```json
{}

```

### Attribute

*None*

<h2 id="tocS_MessageResponse">MessageResponse</h2>

<a id="schemamessageresponse"></a>
<a id="schema_MessageResponse"></a>
<a id="tocSmessageresponse"></a>
<a id="tocsmessageresponse"></a>

```json
{
  "message": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|message|string|true|none||none|

<h2 id="tocS_DeviceType">DeviceType</h2>

<a id="schemadevicetype"></a>
<a id="schema_DeviceType"></a>
<a id="tocSdevicetype"></a>
<a id="tocsdevicetype"></a>

```json
"DESKTOP"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|DESKTOP|
|*anonymous*|MOBILE|
|*anonymous*|TABLET|

<h2 id="tocS_UserInfo">UserInfo</h2>

<a id="schemauserinfo"></a>
<a id="schema_UserInfo"></a>
<a id="tocSuserinfo"></a>
<a id="tocsuserinfo"></a>

```json
"FREE"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|FREE|
|*anonymous*|ARTIST|
|*anonymous*|ARTIST_PRO|

<h2 id="tocS_PublicTier">PublicTier</h2>

<a id="schemapublictier"></a>
<a id="schema_PublicTier"></a>
<a id="tocSpublictier"></a>
<a id="tocspublictier"></a>

```json
"ARTIST"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|ARTIST|
|*anonymous*|ARTIST_PRO|

<h2 id="tocS_PlaylistType">PlaylistType</h2>

<a id="schemaplaylisttype"></a>
<a id="schema_PlaylistType"></a>
<a id="tocSplaylisttype"></a>
<a id="tocsplaylisttype"></a>

```json
"PLAYLIST"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|PLAYLIST|
|*anonymous*|ALBUM|
|*anonymous*|SINGLE|
|*anonymous*|EP|

<h2 id="tocS_CheckUserErrorField">CheckUserErrorField</h2>

<a id="schemacheckusererrorfield"></a>
<a id="schema_CheckUserErrorField"></a>
<a id="tocScheckusererrorfield"></a>
<a id="tocscheckusererrorfield"></a>

```json
"username"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|username|
|*anonymous*|email|

<h2 id="tocS_DeviceInfo">DeviceInfo</h2>

<a id="schemadeviceinfo"></a>
<a id="schema_DeviceInfo"></a>
<a id="tocSdeviceinfo"></a>
<a id="tocsdeviceinfo"></a>

```json
{
  "deviceType": "DESKTOP",
  "fingerPrint": "string",
  "deviceName": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|deviceType|[DeviceType](#schemadevicetype)|true|none||none|
|fingerPrint|string|true|none||none|
|deviceName|string|true|none||none|

<h2 id="tocS_RegisterLocalRequest">RegisterLocalRequest</h2>

<a id="schemaregisterlocalrequest"></a>
<a id="schema_RegisterLocalRequest"></a>
<a id="tocSregisterlocalrequest"></a>
<a id="tocsregisterlocalrequest"></a>

```json
{
  "email": "user@example.com",
  "username": "string",
  "password": "pa$$word",
  "dateOfBirth": "2019-08-24",
  "gender": "string",
  "city": "string",
  "country": "string",
  "captchaToken": "string",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string(email)|true|none||none|
|username|string|true|none||none|
|password|string(password)|true|none||none|
|dateOfBirth|string(date)|true|none||none|
|gender|string|true|none||none|
|city|string|false|none||none|
|country|string|false|none||none|
|captchaToken|string|true|none||none|
|deviceInfo|[DeviceInfo](#schemadeviceinfo)|true|none||none|

<h2 id="tocS_RegisterGoogleRequest">RegisterGoogleRequest</h2>

<a id="schemaregistergooglerequest"></a>
<a id="schema_RegisterGoogleRequest"></a>
<a id="tocSregistergooglerequest"></a>
<a id="tocsregistergooglerequest"></a>

```json
{
  "idToken": "string",
  "username": "string",
  "city": "string",
  "country": "string",
  "captchaToken": "string",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|idToken|string|true|none||none|
|username|string|true|none||none|
|city|string|false|none||none|
|country|string|false|none||none|
|captchaToken|string|true|none||none|
|deviceInfo|[DeviceInfo](#schemadeviceinfo)|true|none||none|

<h2 id="tocS_CheckUserRequest">CheckUserRequest</h2>

<a id="schemacheckuserrequest"></a>
<a id="schema_CheckUserRequest"></a>
<a id="tocScheckuserrequest"></a>
<a id="tocscheckuserrequest"></a>

```json
{
  "email": "user@example.com",
  "username": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string(email)|false|none||none|
|username|string|false|none||none|

<h2 id="tocS_CheckUserAvailableResponse">CheckUserAvailableResponse</h2>

<a id="schemacheckuseravailableresponse"></a>
<a id="schema_CheckUserAvailableResponse"></a>
<a id="tocScheckuseravailableresponse"></a>
<a id="tocscheckuseravailableresponse"></a>

```json
{
  "isAvailable": true,
  "message": "Available!"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|isAvailable|boolean|true|none||none|
|message|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|isAvailable|true|

<h2 id="tocS_CheckUserUnavailableResponse">CheckUserUnavailableResponse</h2>

<a id="schemacheckuserunavailableresponse"></a>
<a id="schema_CheckUserUnavailableResponse"></a>
<a id="tocScheckuserunavailableresponse"></a>
<a id="tocscheckuserunavailableresponse"></a>

```json
{
  "isAvailable": false,
  "errorField": "username",
  "message": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|isAvailable|boolean|true|none||none|
|errorField|[CheckUserErrorField](#schemacheckusererrorfield)|true|none||none|
|message|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|isAvailable|false|

<h2 id="tocS_LoginLocalRequest">LoginLocalRequest</h2>

<a id="schemaloginlocalrequest"></a>
<a id="schema_LoginLocalRequest"></a>
<a id="tocSloginlocalrequest"></a>
<a id="tocsloginlocalrequest"></a>

```json
{
  "email": "user@example.com",
  "password": "pa$$word",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string(email)|true|none||none|
|password|string(password)|true|none||none|
|deviceInfo|[DeviceInfo](#schemadeviceinfo)|true|none||none|

<h2 id="tocS_LoginGoogleRequest">LoginGoogleRequest</h2>

<a id="schemalogingooglerequest"></a>
<a id="schema_LoginGoogleRequest"></a>
<a id="tocSlogingooglerequest"></a>
<a id="tocslogingooglerequest"></a>

```json
{
  "accessToken": "string",
  "idToken": "string",
  "deviceInfo": {
    "deviceType": "DESKTOP",
    "fingerPrint": "string",
    "deviceName": "string"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|accessToken|string|true|none||From Google Dev website|
|idToken|string|true|none||Used to validate token with Google|
|deviceInfo|[DeviceInfo](#schemadeviceinfo)|true|none||none|

<h2 id="tocS_AuthUser">AuthUser</h2>

<a id="schemaauthuser"></a>
<a id="schema_AuthUser"></a>
<a id="tocSauthuser"></a>
<a id="tocsauthuser"></a>

```json
{
  "id": 0,
  "username": "string",
  "tier": "FREE"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|true|none||none|
|username|string|true|none||none|
|tier|[UserInfo](#schemauserinfo)|true|none||none|

<h2 id="tocS_LoginResponse">LoginResponse</h2>

<a id="schemaloginresponse"></a>
<a id="schema_LoginResponse"></a>
<a id="tocSloginresponse"></a>
<a id="tocsloginresponse"></a>

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": 0,
    "username": "string",
    "tier": "FREE",
    "profileUrl": "string",
    "avatarUrl": "string"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|accessToken|string|true|none||none|
|refreshToken|string|true|none||none|
|user|object|true|none||none|
|» id|integer|true|none||none|
|» username|string|true|none||none|
|» tier|[UserInfo](#schemauserinfo)|true|none||none|
|» profileUrl|string|false|none||none|
|» avatarUrl|string|false|none||none|

<h2 id="tocS_RefreshTokenRequest">RefreshTokenRequest</h2>

<a id="schemarefreshtokenrequest"></a>
<a id="schema_RefreshTokenRequest"></a>
<a id="tocSrefreshtokenrequest"></a>
<a id="tocsrefreshtokenrequest"></a>

```json
{
  "refreshToken": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|refreshToken|string|true|none||none|

<h2 id="tocS_RefreshTokenResponse">RefreshTokenResponse</h2>

<a id="schemarefreshtokenresponse"></a>
<a id="schema_RefreshTokenResponse"></a>
<a id="tocSrefreshtokenresponse"></a>
<a id="tocsrefreshtokenresponse"></a>

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|accessToken|string|true|none||none|
|refreshToken|string|true|none||none|

<h2 id="tocS_VerifyEmailRequest">VerifyEmailRequest</h2>

<a id="schemaverifyemailrequest"></a>
<a id="schema_VerifyEmailRequest"></a>
<a id="tocSverifyemailrequest"></a>
<a id="tocsverifyemailrequest"></a>

```json
{
  "token": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|token|string|true|none||none|

<h2 id="tocS_ForgotPasswordRequest">ForgotPasswordRequest</h2>

<a id="schemaforgotpasswordrequest"></a>
<a id="schema_ForgotPasswordRequest"></a>
<a id="tocSforgotpasswordrequest"></a>
<a id="tocsforgotpasswordrequest"></a>

```json
{
  "email": "user@example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|email|string(email)|true|none||none|

<h2 id="tocS_ResetPasswordRequest">ResetPasswordRequest</h2>

<a id="schemaresetpasswordrequest"></a>
<a id="schema_ResetPasswordRequest"></a>
<a id="tocSresetpasswordrequest"></a>
<a id="tocsresetpasswordrequest"></a>

```json
{
  "token": "string",
  "newPassword": "pa$$word"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|token|string|true|none||none|
|newPassword|string(password)|true|none||none|

<h2 id="tocS_ResetLoggedInPasswordRequest">ResetLoggedInPasswordRequest</h2>

<a id="schemaresetloggedinpasswordrequest"></a>
<a id="schema_ResetLoggedInPasswordRequest"></a>
<a id="tocSresetloggedinpasswordrequest"></a>
<a id="tocsresetloggedinpasswordrequest"></a>

```json
{
  "newPassword": "pa$$word"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|newPassword|string(password)|true|none||none|

<h2 id="tocS_AddNewEmailRequest">AddNewEmailRequest</h2>

<a id="schemaaddnewemailrequest"></a>
<a id="schema_AddNewEmailRequest"></a>
<a id="tocSaddnewemailrequest"></a>
<a id="tocsaddnewemailrequest"></a>

```json
{
  "newEmail": "user@example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|newEmail|string(email)|true|none||none|

<h2 id="tocS_UpdatePrimaryEmailRequest">UpdatePrimaryEmailRequest</h2>

<a id="schemaupdateprimaryemailrequest"></a>
<a id="schema_UpdatePrimaryEmailRequest"></a>
<a id="tocSupdateprimaryemailrequest"></a>
<a id="tocsupdateprimaryemailrequest"></a>

```json
{
  "newEmail": "user@example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|newEmail|string(email)|true|none||none|

<h2 id="tocS_PrivateProfile">PrivateProfile</h2>

<a id="schemaprivateprofile"></a>
<a id="schema_PrivateProfile"></a>
<a id="tocSprivateprofile"></a>
<a id="tocsprivateprofile"></a>

```json
{
  "bio": "string",
  "location": "string",
  "profilePic": "http://example.com",
  "coverPic": "http://example.com",
  "favoriteGenres": [
    "string"
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bio|string|false|none||none|
|location|string|false|none||none|
|profilePic|string(uri)|false|none||none|
|coverPic|string(uri)|false|none||none|
|favoriteGenres|[string]|false|none||none|

<h2 id="tocS_PrivateSocialLinks">PrivateSocialLinks</h2>

<a id="schemaprivatesociallinks"></a>
<a id="schema_PrivateSocialLinks"></a>
<a id="tocSprivatesociallinks"></a>
<a id="tocsprivatesociallinks"></a>

```json
{
  "instagram": "http://example.com",
  "website": "http://example.com",
  "supportLink": "http://example.com",
  "twitter": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|instagram|string(uri)|false|none||none|
|website|string(uri)|false|none||none|
|supportLink|string(uri)|false|none||none|
|twitter|string(uri)|false|none||none|

<h2 id="tocS_PrivacySettings">PrivacySettings</h2>

<a id="schemaprivacysettings"></a>
<a id="schema_PrivacySettings"></a>
<a id="tocSprivacysettings"></a>
<a id="tocsprivacysettings"></a>

```json
{
  "isPrivate": true,
  "showHistory": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|isPrivate|boolean|false|none||none|
|showHistory|boolean|false|none||none|

<h2 id="tocS_MyStats">MyStats</h2>

<a id="schemamystats"></a>
<a id="schema_MyStats"></a>
<a id="tocSmystats"></a>
<a id="tocsmystats"></a>

```json
{
  "followers": 0,
  "following": 0,
  "tracksCount": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|followers|integer|false|none||none|
|following|integer|false|none||none|
|tracksCount|integer|false|none||none|

<h2 id="tocS_MeResponse">MeResponse</h2>

<a id="schemameresponse"></a>
<a id="schema_MeResponse"></a>
<a id="tocSmeresponse"></a>
<a id="tocsmeresponse"></a>

```json
{
  "id": 0,
  "Role": "LISTENER",
  "email": "user@example.com",
  "username": "string",
  "emailVerified": true,
  "tier": "ARTIST",
  "profile": {
    "bio": "string",
    "location": "string",
    "profilePic": "http://example.com",
    "coverPic": "http://example.com",
    "favoriteGenres": [
      "string"
    ]
  },
  "socialLinks": {
    "instagram": "http://example.com",
    "website": "http://example.com",
    "supportLink": "http://example.com",
    "twitter": "http://example.com"
  },
  "privacySettings": {
    "isPrivate": true,
    "showHistory": true
  },
  "stats": {
    "followers": 0,
    "following": 0,
    "tracksCount": 0
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|true|none||ID|
|Role|string|true|none||none|
|email|string(email)|false|none||none|
|username|string|false|none||none|
|emailVerified|boolean|true|none||none|
|tier|[PublicTier](#schemapublictier)|false|none||none|
|profile|[PrivateProfile](#schemaprivateprofile)|false|none||none|
|socialLinks|[PrivateSocialLinks](#schemaprivatesociallinks)|false|none||none|
|privacySettings|[PrivacySettings](#schemaprivacysettings)|false|none||none|
|stats|[MyStats](#schemamystats)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|Role|LISTENER|
|Role|ARTIST|

<h2 id="tocS_UpdateMeRequest">UpdateMeRequest</h2>

<a id="schemaupdatemerequest"></a>
<a id="schema_UpdateMeRequest"></a>
<a id="tocSupdatemerequest"></a>
<a id="tocsupdatemerequest"></a>

```json
{
  "bio": "string",
  "city": "string",
  "country": "string",
  "favoriteGenres": [
    "string"
  ],
  "socialLinks": {
    "instagram": "http://example.com",
    "twitter": "http://example.com",
    "website": "http://example.com"
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|bio|string|false|none||none|
|city|string|false|none||none|
|country|string|false|none||none|
|favoriteGenres|[string]|false|none||none|
|socialLinks|[PublicProfileSocialLinks](#schemapublicprofilesociallinks)|true|none||none|

<h2 id="tocS_UpdatePrivacyRequest">UpdatePrivacyRequest</h2>

<a id="schemaupdateprivacyrequest"></a>
<a id="schema_UpdatePrivacyRequest"></a>
<a id="tocSupdateprivacyrequest"></a>
<a id="tocsupdateprivacyrequest"></a>

```json
{
  "isPrivate": true,
  "showHistory": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|isPrivate|boolean|true|none||none|
|showHistory|boolean|true|none||none|

<h2 id="tocS_UpdateTierRequest">UpdateTierRequest</h2>

<a id="schemaupdatetierrequest"></a>
<a id="schema_UpdateTierRequest"></a>
<a id="tocSupdatetierrequest"></a>
<a id="tocsupdatetierrequest"></a>

```json
{
  "newTier": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|newTier|string|true|none||none|

<h2 id="tocS_UpdateSocialLinksRequest">UpdateSocialLinksRequest</h2>

<a id="schemaupdatesociallinksrequest"></a>
<a id="schema_UpdateSocialLinksRequest"></a>
<a id="tocSupdatesociallinksrequest"></a>
<a id="tocsupdatesociallinksrequest"></a>

```json
{
  "instagram": "http://example.com",
  "twitter": "http://example.com",
  "website": "http://example.com",
  "supportLink": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|instagram|string(uri)|false|none||none|
|twitter|string(uri)|false|none||none|
|website|string(uri)|false|none||none|
|supportLink|string(uri)|false|none||none|

<h2 id="tocS_UpdateImagesJsonRequest">UpdateImagesJsonRequest</h2>

<a id="schemaupdateimagesjsonrequest"></a>
<a id="schema_UpdateImagesJsonRequest"></a>
<a id="tocSupdateimagesjsonrequest"></a>
<a id="tocsupdateimagesjsonrequest"></a>

```json
{
  "profilePic": "http://example.com",
  "coverPic": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|profilePic|string(uri)|false|none||none|
|coverPic|string(uri)|false|none||none|

<h2 id="tocS_PublicProfileData">PublicProfileData</h2>

<a id="schemapublicprofiledata"></a>
<a id="schema_PublicProfileData"></a>
<a id="tocSpublicprofiledata"></a>
<a id="tocspublicprofiledata"></a>

```json
{
  "username": "string",
  "id": 0,
  "bio": "string",
  "location": "string",
  "avatarUrl": "http://example.com",
  "coverPhotoUrl": "http://example.com",
  "favoriteGenres": [
    "string"
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|username|string|true|none||none|
|id|integer|true|none||none|
|bio|string|false|none||none|
|location|string|false|none||none|
|avatarUrl|string(uri)|false|none||none|
|coverPhotoUrl|string(uri)|false|none||none|
|favoriteGenres|[string]|false|none||none|

<h2 id="tocS_PublicProfileSocialLinks">PublicProfileSocialLinks</h2>

<a id="schemapublicprofilesociallinks"></a>
<a id="schema_PublicProfileSocialLinks"></a>
<a id="tocSpublicprofilesociallinks"></a>
<a id="tocspublicprofilesociallinks"></a>

```json
{
  "instagram": "http://example.com",
  "twitter": "http://example.com",
  "website": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|instagram|string(uri)|false|none||none|
|twitter|string(uri)|false|none||none|
|website|string(uri)|false|none||none|

<h2 id="tocS_PublicStats">PublicStats</h2>

<a id="schemapublicstats"></a>
<a id="schema_PublicStats"></a>
<a id="tocSpublicstats"></a>
<a id="tocspublicstats"></a>

```json
{
  "followersCount": 0,
  "followingCount": 0,
  "trackCount": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|followersCount|integer|false|none||none|
|followingCount|integer|false|none||none|
|trackCount|integer|false|none||none|

<h2 id="tocS_PublicUserProfileResponse">PublicUserProfileResponse</h2>

<a id="schemapublicuserprofileresponse"></a>
<a id="schema_PublicUserProfileResponse"></a>
<a id="tocSpublicuserprofileresponse"></a>
<a id="tocspublicuserprofileresponse"></a>

```json
{
  "id": 0,
  "username": "string",
  "tier": "ARTIST",
  "profile": {
    "username": "string",
    "id": 0,
    "bio": "string",
    "location": "string",
    "avatarUrl": "http://example.com",
    "coverPhotoUrl": "http://example.com",
    "favoriteGenres": [
      "string"
    ]
  },
  "socialLinks": {
    "instagram": "http://example.com",
    "twitter": "http://example.com",
    "website": "http://example.com"
  },
  "stats": {
    "followersCount": 0,
    "followingCount": 0,
    "trackCount": 0
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|
|tier|[PublicTier](#schemapublictier)|false|none||none|
|profile|[PublicProfileData](#schemapublicprofiledata)|false|none||none|
|socialLinks|[PublicProfileSocialLinks](#schemapublicprofilesociallinks)|false|none||none|
|stats|[PublicStats](#schemapublicstats)|false|none||none|

<h2 id="tocS_FollowResponse">FollowResponse</h2>

<a id="schemafollowresponse"></a>
<a id="schema_FollowResponse"></a>
<a id="tocSfollowresponse"></a>
<a id="tocsfollowresponse"></a>

```json
{
  "message": "string",
  "isFollowing": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|message|string|true|none||none|
|isFollowing|boolean|true|none||none|

<h2 id="tocS_FollowerUser">FollowerUser</h2>

<a id="schemafolloweruser"></a>
<a id="schema_FollowerUser"></a>
<a id="tocSfolloweruser"></a>
<a id="tocsfolloweruser"></a>

```json
{
  "id": 0,
  "username": "string",
  "avatarUrl": "http://example.com",
  "tier": "string",
  "isFollowing": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|
|avatarUrl|string(uri)|false|none||none|
|tier|string|false|none||none|
|isFollowing|boolean|false|none||none|

<h2 id="tocS_PaginatedFollowersResponse">PaginatedFollowersResponse</h2>

<a id="schemapaginatedfollowersresponse"></a>
<a id="schema_PaginatedFollowersResponse"></a>
<a id="tocSpaginatedfollowersresponse"></a>
<a id="tocspaginatedfollowersresponse"></a>

```json
{
  "content": [
    {
      "id": 0,
      "username": "string",
      "avatarUrl": "http://example.com",
      "tier": "string",
      "isFollowing": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|content|[[FollowerUser](#schemafolloweruser)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_TrackArtist">TrackArtist</h2>

<a id="schematrackartist"></a>
<a id="schema_TrackArtist"></a>
<a id="tocStrackartist"></a>
<a id="tocstrackartist"></a>

```json
{
  "id": 0,
  "username": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|

<h2 id="tocS_TrackArtistWithAvatar">TrackArtistWithAvatar</h2>

<a id="schematrackartistwithavatar"></a>
<a id="schema_TrackArtistWithAvatar"></a>
<a id="tocStrackartistwithavatar"></a>
<a id="tocstrackartistwithavatar"></a>

```json
{
  "id": 0,
  "username": "string",
  "avatarUrl": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|
|avatarUrl|string(uri)|false|none||none|

<h2 id="tocS_TrackResponse">TrackResponse</h2>

<a id="schematrackresponse"></a>
<a id="schema_TrackResponse"></a>
<a id="tocStrackresponse"></a>
<a id="tocstrackresponse"></a>

```json
{
  "id": 0,
  "title": "string",
  "artist": {
    "id": 0,
    "username": "string"
  },
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "waveformUrl": "http://example.com",
  "genre": "string",
  "tags": [
    "string"
  ],
  "state": "PROCESSING",
  "releaseDate": "2019-08-24",
  "playCount": 0,
  "likeCount": 0,
  "repostCount": 0,
  "createdAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|title|string|false|none||none|
|artist|[TrackArtist](#schematrackartist)|false|none||none|
|trackUrl|string(uri)|false|none||none|
|coverUrl|string(uri)|false|none||none|
|waveformUrl|string(uri)|false|none||none|
|genre|string|false|none||none|
|tags|[string]|false|none||none|
|state|string|false|none||none|
|releaseDate|string(date)|false|none||none|
|playCount|integer|false|none||none|
|likeCount|integer|false|none||none|
|repostCount|integer|false|none||none|
|createdAt|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|state|PROCESSING|
|state|FINISHED|

<h2 id="tocS_TrackUploadResponse">TrackUploadResponse</h2>

<a id="schematrackuploadresponse"></a>
<a id="schema_TrackUploadResponse"></a>
<a id="tocStrackuploadresponse"></a>
<a id="tocstrackuploadresponse"></a>

```json
{
  "id": 0,
  "title": "string",
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "durationSeconds": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|title|string|false|none||none|
|trackUrl|string(uri)|false|none||none|
|coverUrl|string(uri)|false|none||none|
|durationSeconds|integer|false|none||none|

<h2 id="tocS_UpdateTrackRequest">UpdateTrackRequest</h2>

<a id="schemaupdatetrackrequest"></a>
<a id="schema_UpdateTrackRequest"></a>
<a id="tocSupdatetrackrequest"></a>
<a id="tocsupdatetrackrequest"></a>

```json
{
  "title": "string",
  "genre": "string",
  "tags": [
    "string"
  ],
  "releaseDate": "2019-08-24",
  "description": "string",
  "isPrivate": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|title|string|false|none||none|
|genre|string|false|none||none|
|tags|[string]|false|none||none|
|releaseDate|string(date)|false|none||none|
|description|string|false|none||none|
|isPrivate|boolean|false|none||none|

<h2 id="tocS_CreatePlaylistRequest">CreatePlaylistRequest</h2>

<a id="schemacreateplaylistrequest"></a>
<a id="schema_CreatePlaylistRequest"></a>
<a id="tocScreateplaylistrequest"></a>
<a id="tocscreateplaylistrequest"></a>

```json
{
  "title": "string",
  "description": "string",
  "type": "PLAYLIST",
  "isPrivate": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|title|string|true|none||none|
|description|string|false|none||none|
|type|[PlaylistType](#schemaplaylisttype)|true|none||none|
|isPrivate|boolean|true|none||none|

<h2 id="tocS_PlaylistOwner">PlaylistOwner</h2>

<a id="schemaplaylistowner"></a>
<a id="schema_PlaylistOwner"></a>
<a id="tocSplaylistowner"></a>
<a id="tocsplaylistowner"></a>

```json
{
  "id": 0,
  "username": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|

<h2 id="tocS_PlaylistTrack">PlaylistTrack</h2>

<a id="schemaplaylisttrack"></a>
<a id="schema_PlaylistTrack"></a>
<a id="tocSplaylisttrack"></a>
<a id="tocsplaylisttrack"></a>

```json
{
  "trackId": 0,
  "title": "string",
  "durationSeconds": 0,
  "trackUrl": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|trackId|integer|false|none||none|
|title|string|false|none||none|
|durationSeconds|integer|false|none||none|
|trackUrl|string(uri)|false|none||none|

<h2 id="tocS_PlaylistResponse">PlaylistResponse</h2>

<a id="schemaplaylistresponse"></a>
<a id="schema_PlaylistResponse"></a>
<a id="tocSplaylistresponse"></a>
<a id="tocsplaylistresponse"></a>

```json
{
  "id": 0,
  "title": "string",
  "type": "PLAYLIST",
  "owner": {
    "id": 0,
    "username": "string"
  },
  "tracks": [
    {
      "trackId": 0,
      "title": "string",
      "durationSeconds": 0,
      "trackUrl": "http://example.com"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|title|string|false|none||none|
|type|[PlaylistType](#schemaplaylisttype)|false|none||none|
|owner|[PlaylistOwner](#schemaplaylistowner)|false|none||none|
|tracks|[[PlaylistTrack](#schemaplaylisttrack)]|false|none||none|

<h2 id="tocS_AddTrackToPlaylistRequest">AddTrackToPlaylistRequest</h2>

<a id="schemaaddtracktoplaylistrequest"></a>
<a id="schema_AddTrackToPlaylistRequest"></a>
<a id="tocSaddtracktoplaylistrequest"></a>
<a id="tocsaddtracktoplaylistrequest"></a>

```json
{
  "trackId": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|trackId|integer|true|none||none|

<h2 id="tocS_ReorderTracksRequest">ReorderTracksRequest</h2>

<a id="schemareordertracksrequest"></a>
<a id="schema_ReorderTracksRequest"></a>
<a id="tocSreordertracksrequest"></a>
<a id="tocsreordertracksrequest"></a>

```json
{
  "trackIds": [
    0
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|trackIds|[integer]|true|none||none|

<h2 id="tocS_SecretLinkResponse">SecretLinkResponse</h2>

<a id="schemasecretlinkresponse"></a>
<a id="schema_SecretLinkResponse"></a>
<a id="tocSsecretlinkresponse"></a>
<a id="tocssecretlinkresponse"></a>

```json
{
  "SecretLink": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|SecretLink|string|false|none||none|

<h2 id="tocS_EmbedResponse">EmbedResponse</h2>

<a id="schemaembedresponse"></a>
<a id="schema_EmbedResponse"></a>
<a id="tocSembedresponse"></a>
<a id="tocsembedresponse"></a>

```json
{
  "embedCode": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|embedCode|string|false|none||none|

<h2 id="tocS_LikeResponse">LikeResponse</h2>

<a id="schemalikeresponse"></a>
<a id="schema_LikeResponse"></a>
<a id="tocSlikeresponse"></a>
<a id="tocslikeresponse"></a>

```json
{
  "message": "string",
  "isLiked": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|message|string|true|none||none|
|isLiked|boolean|true|none||none|

<h2 id="tocS_RepostResponse">RepostResponse</h2>

<a id="schemarepostresponse"></a>
<a id="schema_RepostResponse"></a>
<a id="tocSrepostresponse"></a>
<a id="tocsrepostresponse"></a>

```json
{
  "message": "string",
  "isReposted": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|message|string|true|none||none|
|isReposted|boolean|true|none||none|

<h2 id="tocS_CreateCommentRequest">CreateCommentRequest</h2>

<a id="schemacreatecommentrequest"></a>
<a id="schema_CreateCommentRequest"></a>
<a id="tocScreatecommentrequest"></a>
<a id="tocscreatecommentrequest"></a>

```json
{
  "body": "string",
  "timestampSeconds": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|body|string|true|none||none|
|timestampSeconds|integer|false|none||none|

<h2 id="tocS_CommentUser">CommentUser</h2>

<a id="schemacommentuser"></a>
<a id="schema_CommentUser"></a>
<a id="tocScommentuser"></a>
<a id="tocscommentuser"></a>

```json
{
  "id": 0,
  "username": "string",
  "avatarUrl": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|
|avatarUrl|string(uri)|false|none||none|

<h2 id="tocS_Comment">Comment</h2>

<a id="schemacomment"></a>
<a id="schema_Comment"></a>
<a id="tocScomment"></a>
<a id="tocscomment"></a>

```json
{
  "id": 0,
  "user": {
    "id": 0,
    "username": "string",
    "avatarUrl": "http://example.com"
  },
  "body": "string",
  "timestampSeconds": 0,
  "replyToCommentId": 0,
  "createdAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|user|[CommentUser](#schemacommentuser)|false|none||none|
|body|string|false|none||none|
|timestampSeconds|integer|false|none||none|
|replyToCommentId|integer¦null|false|none||none|
|createdAt|string(date-time)|false|none||none|

<h2 id="tocS_PaginatedCommentsResponse">PaginatedCommentsResponse</h2>

<a id="schemapaginatedcommentsresponse"></a>
<a id="schema_PaginatedCommentsResponse"></a>
<a id="tocSpaginatedcommentsresponse"></a>
<a id="tocspaginatedcommentsresponse"></a>

```json
{
  "content": [
    {
      "id": 0,
      "user": {
        "id": 0,
        "username": "string",
        "avatarUrl": "http://example.com"
      },
      "body": "string",
      "timestampSeconds": 0,
      "replyToCommentId": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|content|[[Comment](#schemacomment)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_TrendingTrack">TrendingTrack</h2>

<a id="schematrendingtrack"></a>
<a id="schema_TrendingTrack"></a>
<a id="tocStrendingtrack"></a>
<a id="tocstrendingtrack"></a>

```json
{
  "id": 0,
  "title": "string",
  "artist": {
    "id": 0,
    "username": "string",
    "avatarUrl": "http://example.com"
  },
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "genre": "string",
  "playCount": 0,
  "likeCount": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|title|string|false|none||none|
|artist|[TrackArtistWithAvatar](#schematrackartistwithavatar)|false|none||none|
|trackUrl|string(uri)|false|none||none|
|coverUrl|string(uri)|false|none||none|
|genre|string|false|none||none|
|playCount|integer|false|none||none|
|likeCount|integer|false|none||none|

<h2 id="tocS_SearchUser">SearchUser</h2>

<a id="schemasearchuser"></a>
<a id="schema_SearchUser"></a>
<a id="tocSsearchuser"></a>
<a id="tocssearchuser"></a>

```json
{
  "id": 0,
  "username": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|username|string|false|none||none|

<h2 id="tocS_SearchTrack">SearchTrack</h2>

<a id="schemasearchtrack"></a>
<a id="schema_SearchTrack"></a>
<a id="tocSsearchtrack"></a>
<a id="tocssearchtrack"></a>

```json
{
  "id": 0,
  "title": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|title|string|false|none||none|

<h2 id="tocS_SearchPlaylist">SearchPlaylist</h2>

<a id="schemasearchplaylist"></a>
<a id="schema_SearchPlaylist"></a>
<a id="tocSsearchplaylist"></a>
<a id="tocssearchplaylist"></a>

```json
{
  "id": 0,
  "title": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|title|string|false|none||none|

<h2 id="tocS_SearchType">SearchType</h2>

<a id="schemasearchtype"></a>
<a id="schema_SearchType"></a>
<a id="tocSsearchtype"></a>
<a id="tocssearchtype"></a>

```json
"ALL"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|ALL|
|*anonymous*|USERS|
|*anonymous*|TRACKS|
|*anonymous*|PLAYLISTS|

<h2 id="tocS_SearchResponse">SearchResponse</h2>

<a id="schemasearchresponse"></a>
<a id="schema_SearchResponse"></a>
<a id="tocSsearchresponse"></a>
<a id="tocssearchresponse"></a>

```json
{
  "users": [
    {
      "id": 0,
      "username": "string"
    }
  ],
  "tracks": [
    {
      "id": 0,
      "title": "string"
    }
  ],
  "playlists": [
    {
      "id": 0,
      "title": "string"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|users|[[SearchUser](#schemasearchuser)]|false|none||none|
|tracks|[[SearchTrack](#schemasearchtrack)]|false|none||none|
|playlists|[[SearchPlaylist](#schemasearchplaylist)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_FeedTrack">FeedTrack</h2>

<a id="schemafeedtrack"></a>
<a id="schema_FeedTrack"></a>
<a id="tocSfeedtrack"></a>
<a id="tocsfeedtrack"></a>

```json
{
  "id": 0,
  "title": "string",
  "artist": {
    "id": 0,
    "username": "string"
  },
  "trackUrl": "http://example.com",
  "coverUrl": "http://example.com",
  "waveformUrl": "http://example.com",
  "genre": "string",
  "tags": [
    "string"
  ],
  "state": "PROCESSING",
  "releaseDate": "2019-08-24",
  "playCount": 0,
  "likeCount": 0,
  "repostCount": 0,
  "createdAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

*None*

<h2 id="tocS_PaginatedFeedResponse">PaginatedFeedResponse</h2>

<a id="schemapaginatedfeedresponse"></a>
<a id="schema_PaginatedFeedResponse"></a>
<a id="tocSpaginatedfeedresponse"></a>
<a id="tocspaginatedfeedresponse"></a>

```json
{
  "content": [
    {
      "id": 0,
      "title": "string",
      "artist": {
        "id": 0,
        "username": "string"
      },
      "trackUrl": "http://example.com",
      "coverUrl": "http://example.com",
      "waveformUrl": "http://example.com",
      "genre": "string",
      "tags": [
        "string"
      ],
      "state": "PROCESSING",
      "releaseDate": "2019-08-24",
      "playCount": 0,
      "likeCount": 0,
      "repostCount": 0,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|content|[[FeedTrack](#schemafeedtrack)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_ResourceResolutionResponse">ResourceResolutionResponse</h2>

<a id="schemaresourceresolutionresponse"></a>
<a id="schema_ResourceResolutionResponse"></a>
<a id="tocSresourceresolutionresponse"></a>
<a id="tocsresourceresolutionresponse"></a>

```json
{
  "resourceId": 0,
  "resourceType": "USER"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|resourceId|integer|false|none||none|
|resourceType|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|resourceType|USER|
|resourceType|TRACK|
|resourceType|PLAYLIST|

<h2 id="tocS_ConversationResponse">ConversationResponse</h2>

<a id="schemaconversationresponse"></a>
<a id="schema_ConversationResponse"></a>
<a id="tocSconversationresponse"></a>
<a id="tocsconversationresponse"></a>

```json
{
  "id": 0,
  "user1": {
    "id": 0,
    "username": "string"
  },
  "user2": {
    "id": 0,
    "username": "string"
  },
  "unreadCount": 0,
  "lastMessageAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|user1|[SearchUser](#schemasearchuser)|false|none||none|
|user2|[SearchUser](#schemasearchuser)|false|none||none|
|unreadCount|integer|false|none||none|
|lastMessageAt|string(date-time)|false|none||none|

<h2 id="tocS_PaginatedConversationsResponse">PaginatedConversationsResponse</h2>

<a id="schemapaginatedconversationsresponse"></a>
<a id="schema_PaginatedConversationsResponse"></a>
<a id="tocSpaginatedconversationsresponse"></a>
<a id="tocspaginatedconversationsresponse"></a>

```json
{
  "content": [
    {
      "id": 0,
      "user1": {
        "id": 0,
        "username": "string"
      },
      "user2": {
        "id": 0,
        "username": "string"
      },
      "unreadCount": 0,
      "lastMessageAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|content|[[ConversationResponse](#schemaconversationresponse)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_MessageObject">MessageObject</h2>

<a id="schemamessageobject"></a>
<a id="schema_MessageObject"></a>
<a id="tocSmessageobject"></a>
<a id="tocsmessageobject"></a>

```json
{
  "id": 0,
  "conversationId": 0,
  "senderId": 0,
  "content": "string",
  "resourceType": "TRACK",
  "resourceId": 0,
  "createdAt": "2019-08-24T14:15:22Z",
  "isRead": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|conversationId|integer|false|none||none|
|senderId|integer|false|none||none|
|content|string|false|none||none|
|resourceType|string¦null|false|none||none|
|resourceId|integer¦null|false|none||none|
|createdAt|string(date-time)|false|none||none|
|isRead|boolean|false|none||none|

#### Enum

|Name|Value|
|---|---|
|resourceType|TRACK|
|resourceType|PLAYLIST|

<h2 id="tocS_CreateMessageRequest">CreateMessageRequest</h2>

<a id="schemacreatemessagerequest"></a>
<a id="schema_CreateMessageRequest"></a>
<a id="tocScreatemessagerequest"></a>
<a id="tocscreatemessagerequest"></a>

```json
{
  "body": "string",
  "resourceType": "TRACK",
  "resourceId": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|body|string|true|none||none|
|resourceType|string|false|none||none|
|resourceId|integer|false|none||none|

#### Enum

|Name|Value|
|---|---|
|resourceType|TRACK|
|resourceType|PLAYLIST|

<h2 id="tocS_PaginatedMessagesResponse">PaginatedMessagesResponse</h2>

<a id="schemapaginatedmessagesresponse"></a>
<a id="schema_PaginatedMessagesResponse"></a>
<a id="tocSpaginatedmessagesresponse"></a>
<a id="tocspaginatedmessagesresponse"></a>

```json
{
  "content": [
    {
      "id": 0,
      "conversationId": 0,
      "senderId": 0,
      "content": "string",
      "resourceType": "TRACK",
      "resourceId": 0,
      "createdAt": "2019-08-24T14:15:22Z",
      "isRead": true
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|content|[[MessageObject](#schemamessageobject)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_ConversationCreatedResponse">ConversationCreatedResponse</h2>

<a id="schemaconversationcreatedresponse"></a>
<a id="schema_ConversationCreatedResponse"></a>
<a id="tocSconversationcreatedresponse"></a>
<a id="tocsconversationcreatedresponse"></a>

```json
{
  "conversationId": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|conversationId|integer|false|none||none|

<h2 id="tocS_NotificationObject">NotificationObject</h2>

<a id="schemanotificationobject"></a>
<a id="schema_NotificationObject"></a>
<a id="tocSnotificationobject"></a>
<a id="tocsnotificationobject"></a>

```json
{
  "id": 0,
  "type": "string",
  "actor": {
    "id": 0,
    "username": "string"
  },
  "entityId": 0,
  "isRead": true,
  "createdAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|type|string|false|none||none|
|actor|[SearchUser](#schemasearchuser)|false|none||none|
|entityId|integer|false|none||none|
|isRead|boolean|false|none||none|
|createdAt|string(date-time)|false|none||none|

<h2 id="tocS_PaginatedNotificationsResponse">PaginatedNotificationsResponse</h2>

<a id="schemapaginatednotificationsresponse"></a>
<a id="schema_PaginatedNotificationsResponse"></a>
<a id="tocSpaginatednotificationsresponse"></a>
<a id="tocspaginatednotificationsresponse"></a>

```json
{
  "content": [
    {
      "id": 0,
      "type": "string",
      "actor": {
        "id": 0,
        "username": "string"
      },
      "entityId": 0,
      "isRead": true,
      "createdAt": "2019-08-24T14:15:22Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 0,
  "totalElements": 0,
  "totalPages": 0,
  "isLast": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|content|[[NotificationObject](#schemanotificationobject)]|false|none||none|
|pageNumber|integer|false|none||none|
|pageSize|integer|false|none||none|
|totalElements|integer|false|none||none|
|totalPages|integer|false|none||none|
|isLast|boolean|false|none||none|

<h2 id="tocS_NotificationSettings">NotificationSettings</h2>

<a id="schemanotificationsettings"></a>
<a id="schema_NotificationSettings"></a>
<a id="tocSnotificationsettings"></a>
<a id="tocsnotificationsettings"></a>

```json
{
  "notifyOnFollow": true,
  "notifyOnLike": true,
  "notifyOnRepost": true,
  "notifyOnComment": true,
  "notifyOnDM": true
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|notifyOnFollow|boolean|false|none||none|
|notifyOnLike|boolean|false|none||none|
|notifyOnRepost|boolean|false|none||none|
|notifyOnComment|boolean|false|none||none|
|notifyOnDM|boolean|false|none||none|

<h2 id="tocS_UnreadCountResponse">UnreadCountResponse</h2>

<a id="schemaunreadcountresponse"></a>
<a id="schema_UnreadCountResponse"></a>
<a id="tocSunreadcountresponse"></a>
<a id="tocsunreadcountresponse"></a>

```json
{
  "unreadCount": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|unreadCount|integer|false|none||none|

<h2 id="tocS_DeviceTokenRequest">DeviceTokenRequest</h2>

<a id="schemadevicetokenrequest"></a>
<a id="schema_DeviceTokenRequest"></a>
<a id="tocSdevicetokenrequest"></a>
<a id="tocsdevicetokenrequest"></a>

```json
{
  "token": "string",
  "deviceType": "DESKTOP"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|token|string|true|none||none|
|deviceType|[DeviceType](#schemadevicetype)|true|none||none|

<h2 id="tocS_ReportRequest">ReportRequest</h2>

<a id="schemareportrequest"></a>
<a id="schema_ReportRequest"></a>
<a id="tocSreportrequest"></a>
<a id="tocsreportrequest"></a>

```json
{
  "reason": "string",
  "description": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|reason|string|true|none||none|
|description|string|false|none||none|

<h2 id="tocS_UpdateReportRequest">UpdateReportRequest</h2>

<a id="schemaupdatereportrequest"></a>
<a id="schema_UpdateReportRequest"></a>
<a id="tocSupdatereportrequest"></a>
<a id="tocsupdatereportrequest"></a>

```json
{
  "status": "OPEN"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|status|string|true|none||none|

#### Enum

|Name|Value|
|---|---|
|status|OPEN|
|status|IN_REVIEW|
|status|RESOLVED|
|status|DISMISSED|

<h2 id="tocS_ReportResponse">ReportResponse</h2>

<a id="schemareportresponse"></a>
<a id="schema_ReportResponse"></a>
<a id="tocSreportresponse"></a>
<a id="tocsreportresponse"></a>

```json
{
  "id": 0,
  "reporterId": 0,
  "targetType": "string",
  "status": "string",
  "createdAt": "2019-08-24T14:15:22Z"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|integer|false|none||none|
|reporterId|integer|false|none||none|
|targetType|string|false|none||none|
|status|string|false|none||none|
|createdAt|string(date-time)|false|none||none|

<h2 id="tocS_SuspendUserRequest">SuspendUserRequest</h2>

<a id="schemasuspenduserrequest"></a>
<a id="schema_SuspendUserRequest"></a>
<a id="tocSsuspenduserrequest"></a>
<a id="tocssuspenduserrequest"></a>

```json
{
  "durationDays": 0,
  "reason": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|durationDays|integer|true|none||none|
|reason|string|true|none||none|

<h2 id="tocS_AnalyticsResponse">AnalyticsResponse</h2>

<a id="schemaanalyticsresponse"></a>
<a id="schema_AnalyticsResponse"></a>
<a id="tocSanalyticsresponse"></a>
<a id="tocsanalyticsresponse"></a>

```json
{
  "totalUsers": 0,
  "artistToListenerRatio": "string",
  "totalTracks": 0,
  "totalPlays": 0,
  "playThroughRate": 0,
  "totalStorageUsedBytes": 0
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|totalUsers|integer|false|none||none|
|artistToListenerRatio|string|false|none||none|
|totalTracks|integer|false|none||none|
|totalPlays|integer|false|none||none|
|playThroughRate|number|false|none||none|
|totalStorageUsedBytes|integer|false|none||none|

<h2 id="tocS_CheckoutRequest">CheckoutRequest</h2>

<a id="schemacheckoutrequest"></a>
<a id="schema_CheckoutRequest"></a>
<a id="tocScheckoutrequest"></a>
<a id="tocscheckoutrequest"></a>

```json
{
  "tier": "ARTIST"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|tier|[PublicTier](#schemapublictier)|true|none||none|

<h2 id="tocS_CheckoutResponse">CheckoutResponse</h2>

<a id="schemacheckoutresponse"></a>
<a id="schema_CheckoutResponse"></a>
<a id="tocScheckoutresponse"></a>
<a id="tocscheckoutresponse"></a>

```json
{
  "checkoutUrl": "http://example.com"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|checkoutUrl|string(uri)|false|none||none|

