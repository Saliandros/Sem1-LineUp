# 🎵 Mojah Web Consulting API Documentation

## Overview

This is the backend API for the Mojah Web Consulting platform. It provides endpoints for user authentication, profile management, posts, collaborations, messaging, and connections.

**Base URL:** `http://localhost:3000`
**Production URL:** (to be updated)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

## Getting Started

### Requirements

- Node.js 16+
- npm or yarn
- Supabase account (credentials in `.env`)

### Installation

```bash
cd backend
npm install
npm run dev
```

The API will start on `http://localhost:3000`

---

## Authentication

### How it Works

1. User signs up or logs in
2. Server returns `access_token` (JWT)
3. Include token in `Authorization` header for protected endpoints

### Token Format

```
Authorization: Bearer <access_token>
```

### Token Expiration

- Access tokens expire after **1 hour**
- Use refresh token to get a new one (endpoint coming soon)

---

## Endpoints

### 🔐 Authentication

#### POST `/api/auth/signup`

Create a new user account

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "username"
}
```

**Response (201):**

```json
{
  "message": "User created successfully",
  "user": { ...user object... },
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

**Errors:**

- `400` - Email already exists or validation failed
- `500` - Database error

---

#### POST `/api/auth/login`

Login with email and password

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "user": { ...user object... },
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "abc123..."
  }
}
```

**Errors:**

- `401` - Invalid credentials
- `400` - Email not confirmed or validation failed

---

#### GET `/api/auth/me`

Get current authenticated user

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "username": "username"
    }
  }
}
```

**Errors:**

- `401` - Invalid or expired token
- `400` - No token provided

---

### 👤 Profiles

#### GET `/api/profiles`

Get all user profiles

**Query Parameters:**

- `limit` (optional) - Number of profiles to return
- `offset` (optional) - Pagination offset

**Response (200):**

```json
{
  "profiles": [
    {
      "id": "uuid",
      "username": "username",
      "user_bio": "Bio text",
      "city": "Copenhagen",
      "user_genre": "Electronic",
      "user_interest": "Music Production",
      "user_image": "image_url",
      "created_at": "2025-12-03T10:20:41Z"
    }
  ]
}
```

---

#### GET `/api/profiles/:userId`

Get a specific user's profile

**Response (200):**

```json
{
  "profile": {
    "id": "uuid",
    "username": "username",
    "user_bio": "Bio text",
    ...
  }
}
```

**Errors:**

- `404` - User not found

---

#### PUT `/api/profiles`

Update your own profile (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "username": "newusername",
  "user_bio": "New bio",
  "city": "Aarhus",
  "user_genre": "House",
  "user_interest": "DJ, Mixing",
  "user_social": "@instagram",
  "user_artist": "Artist Name",
  "user_music": "Link to music",
  "country_code": "DK",
  "birth_date": "1990-01-15"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "profile": { ...updated profile... }
}
```

**Errors:**

- `401` - Unauthorized
- `400` - Validation error

---

#### POST `/api/profiles/:userId/upload-image`

Upload a profile image

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "imageUrl": "https://supabase-url.com/storage/uploads/image.jpg"
}
```

**Response (200):**

```json
{
  "message": "Profile image updated",
  "profile": { ...updated profile with image... }
}
```

---

### 📝 Posts

#### POST `/api/posts`

Create a new post (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**

```json
{
  "post_title": "My First Track",
  "post_description": "Just finished this banger!",
  "post_tags": ["electronic", "house", "production"]
}
```

**Response (201):**

```json
{
  "message": "Post created successfully",
  "post": {
    "post_id": "uuid",
    "post_title": "My First Track",
    "post_description": "Just finished this banger!",
    "user_id": "uuid",
    "created_at": "2025-12-03T12:00:00Z"
  }
}
```

**Errors:**

- `401` - Unauthorized
- `400` - Missing required fields

---

#### GET `/api/posts`

Get all posts

**Query Parameters:**

- `limit` (optional) - Default: 10
- `offset` (optional) - Default: 0
- `userId` (optional) - Filter by user

**Response (200):**

```json
{
  "posts": [
    {
      "post_id": "uuid",
      "post_title": "My First Track",
      "post_description": "Description",
      "post_image": "image_url",
      "post_tags": ["tag1", "tag2"],
      "user_id": "uuid",
      "username": "username",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

#### GET `/api/posts/:postId`

Get a specific post

**Response (200):**

```json
{
  "post": { ...post details... }
}
```

**Errors:**

- `404` - Post not found

---

### 🤝 Collaborations

#### POST `/api/collaborations`

Create a collaboration post (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "collab_title": "Looking for a vocalist",
  "collab_description": "Need a female vocalist for electronic track",
  "collab_genres": ["Electronic", "House"],
  "collab_location": "Copenhagen"
}
```

**Response (201):**

```json
{
  "message": "Collaboration created successfully",
  "collaboration": { ...collab details... }
}
```

---

#### GET `/api/collaborations`

Get all collaborations

**Response (200):**

```json
{
  "collaborations": [
    {
      "collab_id": "uuid",
      "collab_title": "Looking for a vocalist",
      "collab_description": "Description",
      "collab_location": "Copenhagen",
      "username": "username",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

### 💬 Threads (Messaging)

#### POST `/api/threads`

Create a conversation with another user (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "user_id_1": "other-user-uuid"
}
```

**Response (201):**

```json
{
  "message": "Thread created successfully",
  "thread": {
    "thread_id": "uuid",
    "user_id": "your-uuid",
    "user_id_1": "other-user-uuid",
    "created_at": "2025-12-03T12:00:00Z"
  }
}
```

**Errors:**

- `401` - Unauthorized
- `409` - Thread already exists

---

#### GET `/api/threads`

Get all your threads/conversations (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "threads": [
    {
      "thread_id": "uuid",
      "user_id": "uuid",
      "user_id_1": "uuid",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

### ✉️ Messages

#### POST `/api/messages`

Send a message in a thread (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "thread_id": "thread-uuid",
  "message_content": "Hey! Let's collaborate!"
}
```

**Response (201):**

```json
{
  "message": "Message sent successfully",
  "data": {
    "message_id": "uuid",
    "thread_id": "uuid",
    "message_content": "Hey! Let's collaborate!",
    "created_at": "2025-12-03T12:00:00Z"
  }
}
```

---

#### GET `/api/messages/thread/:threadId`

Get all messages in a thread (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "messages": [
    {
      "message_id": "uuid",
      "thread_id": "uuid",
      "message_content": "Hey! Let's collaborate!",
      "user_id": "uuid",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

### 🔗 Connections

#### POST `/api/connections`

Create a connection/friendship (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "user_id_2": "other-user-uuid"
}
```

**Response (201):**

```json
{
  "message": "Connection created successfully",
  "connection": {
    "connection_id": "uuid",
    "user_id_1": "your-uuid",
    "user_id_2": "other-user-uuid",
    "created_at": "2025-12-03T12:00:00Z"
  }
}
```

**Errors:**

- `409` - Connection already exists
- `400` - Cannot connect to yourself

---

#### GET `/api/connections`

Get all your connections/friends (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "connections": [
    {
      "connection_id": "uuid",
      "user_id_1": "uuid",
      "user_id_2": "uuid",
      "username": "connected-user-name",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

### 🎵 Genres

#### POST `/api/genres`

Create a new genre (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "genre_name": "Techno"
}
```

**Response (201):**

```json
{
  "message": "Genre created successfully",
  "genre": {
    "genre_id": "uuid",
    "genre_name": "Techno",
    "created_at": "2025-12-03T12:00:00Z"
  }
}
```

---

#### GET `/api/genres`

Get all genres

**Response (200):**

```json
{
  "genres": [
    {
      "genre_id": "uuid",
      "genre_name": "Electronic",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

### 🏷️ Tags

#### POST `/api/tags`

Create a new tag (authenticated)

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "tag_name": "production"
}
```

**Response (201):**

```json
{
  "message": "Tag created successfully",
  "tag": {
    "tag_id": "uuid",
    "tag_name": "production",
    "created_at": "2025-12-03T12:00:00Z"
  }
}
```

---

#### GET `/api/tags`

Get all tags

**Response (200):**

```json
{
  "tags": [
    {
      "tag_id": "uuid",
      "tag_name": "production",
      "created_at": "2025-12-03T12:00:00Z"
    }
  ]
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "More specific details (optional)",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 404  | Not Found    |
| 409  | Conflict     |
| 500  | Server Error |

---

## Examples

### Example 1: Sign Up & Create a Post

```javascript
// 1. Sign up
const signupRes = await fetch("http://localhost:3000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "SecurePass123",
    username: "myusername",
  }),
});

const { session } = await signupRes.json();
const token = session.access_token;

// 2. Create a post
const postRes = await fetch("http://localhost:3000/api/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    post_title: "My First Track",
    post_description: "Just finished this banger!",
    post_tags: ["electronic", "house"],
  }),
});

const post = await postRes.json();
console.log("Post created:", post);
```

### Example 2: Send a Message

```javascript
// 1. Create a thread
const threadRes = await fetch("http://localhost:3000/api/threads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    user_id_1: "other-user-uuid",
  }),
});

const { thread } = await threadRes.json();
const threadId = thread.thread_id;

// 2. Send a message
const msgRes = await fetch("http://localhost:3000/api/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    thread_id: threadId,
    message_content: "Hey! Let's collaborate!",
  }),
});

const message = await msgRes.json();
console.log("Message sent:", message);
```

---

## Notes for Frontend Team

✅ Some of the endpoints are tested and working, but might still be some problems
✅ Use `Bearer <token>` format for authenticated requests
✅ Tokens expire after 1 hour
✅ Always include `Content-Type: application/json` header for POST/PUT requests
✅ Handle 401 errors by redirecting to login
✅ Store token in localStorage or sessionStorage for persistence

---

## Contact & Support

For issues or questions, contact the backend team!
