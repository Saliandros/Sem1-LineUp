# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication using Bearer tokens from Supabase Auth.

Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## Authentication Endpoints

### Sign Up
**POST** `/api/auth/signup`

Create a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username" // optional
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Logged in successfully",
  "user": { ... },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

### Logout
**POST** `/api/auth/logout`
- Requires authentication

### Get Current User
**GET** `/api/auth/me`
- Requires authentication

### Refresh Session
**POST** `/api/auth/refresh`

**Body:**
```json
{
  "refresh_token": "your-refresh-token"
}
```

---

## Profile Endpoints

### Get All Profiles
**GET** `/api/profiles`

### Get Profile by User ID
**GET** `/api/profiles/:userId`

### Create/Update Profile
**PUT** `/api/profiles`
- Requires authentication

**Body:**
```json
{
  "username": "johndoe",
  "user_bio": "Music producer and DJ",
  "user_desc": "Full description",
  "user_interest": "Electronic music",
  "user_genre": "Techno",
  "user_theme": "Dark",
  "user_social": "https://instagram.com/...",
  "user_artist": "DJ Name",
  "user_music": "Spotify link",
  "user_image": "https://...",
  "country_code": "DK",
  "birth_date": "1990-01-01",
  "city": "Copenhagen",
  "interests": "Music, Production",
  "user_phone": "+45...",
  "user_type": "artist"
}
```

### Delete Profile
**DELETE** `/api/profiles/:userId`
- Requires authentication (own profile only)

### Upload Profile Image
**POST** `/api/profiles/:userId/upload-image`
- Requires authentication

**Body:**
```json
{
  "imageUrl": "https://..."
}
```

---

## Thread Endpoints

### Get All Threads
**GET** `/api/threads`

### Get Thread by ID
**GET** `/api/threads/:threadId`

Returns thread with participants.

**Response:**
```json
{
  "thread": {
    "thread_id": "uuid",
    "thread_name": "Optional group name",
    "thread_type": "direct",
    "created_by_user_id": "uuid",
    "created_at": "...",
    "participants": [
      {
        "user_id": "uuid",
        "role": "member",
        "joined_at": "...",
        "profiles": {
          "id": "uuid",
          "displayname": "John Doe",
          "user_image": "https://..."
        }
      }
    ]
  }
}
```

### Get Threads by User
**GET** `/api/threads/user/:userId`

Returns all threads where the user is a participant.

### Create Thread
**POST** `/api/threads`
- Requires authentication

**Body:**
```json
{
  "participant_ids": ["uuid-of-user-2", "uuid-of-user-3"],
  "thread_name": "Optional group name",
  "thread_type": "direct"
}
```

**Notes:**
- `participant_ids` should be an array of user IDs (excluding the creator)
- For 1-to-1 chat: pass array with 1 user ID
- For group chat: pass array with 2+ user IDs
- `thread_type` defaults to "direct" for 1 participant, "group" for multiple

### Delete Thread
**DELETE** `/api/threads/:threadId`
- Requires authentication (creator only)
- Cascades to delete messages and participants

---

## Message Endpoints

### Get Messages by Thread
**GET** `/api/messages/thread/:threadId`
- Requires authentication

### Get Message by ID
**GET** `/api/messages/:messageId`
- Requires authentication

### Send Message
**POST** `/api/messages`
- Requires authentication

**Body:**
```json
{
  "thread_id": "uuid",
  "message_content": "Hello there!"
}
```

### Update Message
**PUT** `/api/messages/:messageId`
- Requires authentication

**Body:**
```json
{
  "message_content": "Updated message"
}
```

### Delete Message
**DELETE** `/api/messages/:messageId`
- Requires authentication

---

## Collaboration Endpoints

### Get All Collaborations
**GET** `/api/collaborations`

Query parameters:
- `genre`: Filter by genre
- `location`: Filter by location

### Get Collaboration by ID
**GET** `/api/collaborations/:collabId`

### Get Collaborations by User
**GET** `/api/collaborations/user/:userId`

### Create Collaboration
**POST** `/api/collaborations`
- Requires authentication

**Body:**
```json
{
  "collab_title": "Looking for vocalist",
  "collab_description": "Need a vocalist for my track",
  "collab_image": "https://...",
  "collab_genres": ["Electronic", "Pop"],
  "collab_location": "Copenhagen"
}
```

### Update Collaboration
**PUT** `/api/collaborations/:collabId`
- Requires authentication (owner only)

### Delete Collaboration
**DELETE** `/api/collaborations/:collabId`
- Requires authentication (owner only)

---

## Post Endpoints

### Get All Posts
**GET** `/api/posts`

### Get Post by ID
**GET** `/api/posts/:postId`

### Get Posts by User
**GET** `/api/posts/user/:userId`

### Create Post
**POST** `/api/posts`
- Requires authentication

**Body:**
```json
{
  "post_title": "My new track",
  "post_description": "Check out my latest production",
  "post_image": "https://...",
  "post_tags": ["electronic", "house"]
}
```

### Update Post
**PUT** `/api/posts/:postId`
- Requires authentication (owner only)

### Delete Post
**DELETE** `/api/posts/:postId`
- Requires authentication (owner only)

---

## Genre Endpoints

### Get All Genres
**GET** `/api/genres`

### Create Genre
**POST** `/api/genres`
- Requires authentication

**Body:**
```json
{
  "genre_name": "Techno"
}
```

### Delete Genre
**DELETE** `/api/genres/:genreName`
- Requires authentication

---

## Tag Endpoints

### Get All Tags
**GET** `/api/tags`

### Get Posts by Tag
**GET** `/api/tags/:tagName/posts`

### Create Tag
**POST** `/api/tags`
- Requires authentication

**Body:**
```json
{
  "tag_name": "electronic"
}
```

### Delete Tag
**DELETE** `/api/tags/:tagName`
- Requires authentication

---

## File Upload Endpoints

### Upload Image
**POST** `/api/uploads/upload`
- Requires authentication
- Content-Type: multipart/form-data

**Form Data:**
- `file`: Image file (JPEG, PNG, GIF, WebP)
- `bucket`: Storage bucket name (optional, defaults to "images")

**Response:**
```json
{
  "message": "File uploaded successfully",
  "url": "https://...",
  "path": "user-id/timestamp.jpg"
}
```

### Delete Image
**DELETE** `/api/uploads/delete`
- Requires authentication

**Body:**
```json
{
  "path": "user-id/timestamp.jpg",
  "bucket": "images"
}
```

### List User Files
**GET** `/api/uploads/list?bucket=images`
- Requires authentication

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "error": "No token provided"
}
```

**403 Forbidden**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Error message"
}
```
