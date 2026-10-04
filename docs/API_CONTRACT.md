# API Contract — v1 draft

The contract below is the target shape for backend integration. It is intentionally small enough for the first implementation.

## Authentication

### POST /auth/login

~~~json
{
  "email": "user@example.com",
  "password": "example-password"
}
~~~

Response:

~~~json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": "usr_123",
    "username": "kunal",
    "display_name": "Kunal Mathiyan"
  }
}
~~~

## Feed

### GET /feed?cursor=&limit=24&category=

~~~json
{
  "items": [
    {
      "id": "pin_123",
      "title": "Warm minimal living room",
      "description": "...",
      "image_url": "https://cdn.example.com/pins/pin_123.jpg",
      "thumbnail_url": "https://cdn.example.com/pins/pin_123-sm.jpg",
      "category": "Design",
      "author": {
        "id": "usr_8",
        "name": "Aarav Studio",
        "avatar_url": null
      },
      "stats": {
        "likes": 124,
        "saves": 92,
        "comments": 14
      },
      "viewer": {
        "saved": false,
        "liked": false
      },
      "created_at": "2026-10-04T09:10:00Z"
    }
  ],
  "next_cursor": "..."
}
~~~

## Pin detail

GET /pins/:id returns the same pin shape plus comments and related pins when available.

## Create pin

### POST /pins

~~~json
{
  "title": "Cozy workspace",
  "description": "A calm desk setup for deep work.",
  "category": "Tech",
  "image_key": "users/usr_123/uploads/abc.jpg"
}
~~~

## Save

### POST /pins/:id/save

~~~json
{ "board_id": "board_123" }
~~~

Response:

~~~json
{ "saved": true, "board_id": "board_123" }
~~~

### DELETE /pins/:id/save

~~~json
{ "saved": false }
~~~

## Search

GET /search?q=workspace&category=Tech&cursor= returns the feed result shape, with optional search metadata.

~~~json
{
  "items": [],
  "next_cursor": null,
  "query": "workspace",
  "total_estimate": 42
}
~~~

## Error format

~~~json
{
  "error": {
    "code": "PIN_NOT_FOUND",
    "message": "Pin was not found.",
    "request_id": "req_123"
  }
}
~~~

## Frontend mapping

| Current UI action | Future endpoint |
| --- | --- |
| Search input | GET /search |
| Category chip | GET /feed?category= |
| Open pin | GET /pins/:id |
| Save / unsave | POST/DELETE /pins/:id/save |
| Create pin | POST /pins after upload |
| Profile | GET /me + profile endpoints |
| Like | POST/DELETE /pins/:id/like |
| Share | POST /pins/:id/share or client-side share URL |
