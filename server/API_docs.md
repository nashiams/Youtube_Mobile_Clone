# Social Media GraphQL API Documentation

## Models

**User**

- \_id: ID!
- name: String
- username: String
- email: String

**UserDetail**

- \_id: ID!
- name: String
- username: String
- email: String
- followers: [User]
- following: [User]
- posts: [UserPost]

**UserPost**

- \_id: ID!
- content: String
- imgUrl: String
- authorId: String!
- createdAt: String
- updatedAt: String

**Post**

- \_id: String!
- content: String
- imgUrl: String
- authorId: String!
- createdAt: String
- updatedAt: String
- tags: [String]
- likes: [Likes]
- comments: [Comments]
- userDetail: User

**Likes**

- postId: String!
- username: String
- createdAt: String
- updatedAt: String

**Comments**

- username: String
- content: String
- createdAt: String
- updatedAt: String

**Follow**

- followingId: String!

**LoginResponse**

- token: String!
- userId: ID!

---

## Endpoints (GraphQL Operations)

### Public Mutations

- `register(name: String!, username: String!, email: String!, password: String!): User`
- `login(email: String!, password: String!): LoginResponse`

### Authenticated Queries

- `users: [User]`
- `searchUser(searchTerm: String!): [User]`
- `getUserById(_id: String!): UserDetail`
- `posts: [Post]`
- `getPostById(postId: String!): [Post]`
- `follows: [Follow]`

### Authenticated Mutations

- `addPost(content: String!, imgUrl: String, tags: [String]): Post`
- `commentPost(postId: String!, content: String): Comments`
- `likePost(postId: String!): Likes`
- `followUser(followingId: String!): Follow`

---

## Example Operations

### 1. Register

```graphql
mutation {
  register(
    name: "Alice"
    username: "alice123"
    email: "alice@mail.com"
    password: "secret"
  ) {
    _id
    name
    username
    email
  }
}
```

_Response:_

```json
{
  "data": {
    "register": {
      "_id": "1",
      "name": "Alice",
      "username": "alice123",
      "email": "alice@mail.com"
    }
  }
}
```

---

### 2. Login

```graphql
mutation {
  login(email: "alice@mail.com", password: "secret") {
    token
    userId
  }
}
```

_Response:_

```json
{
  "data": {
    "login": {
      "token": "jwt_token",
      "userId": "1"
    }
  }
}
```

---

### 3. Get All Users

```graphql
query {
  users {
    _id
    name
    username
    email
  }
}
```

---

### 4. Search User

```graphql
query {
  searchUser(searchTerm: "bob") {
    _id
    name
    username
    email
  }
}
```

---

### 5. Get User By Id

```graphql
query {
  getUserById(_id: "1") {
    _id
    name
    username
    email
    followers {
      _id
      username
    }
    following {
      _id
      username
    }
    posts {
      _id
      content
      imgUrl
    }
  }
}
```

---

### 6. Get All Posts

```graphql
query {
  posts {
    _id
    content
    imgUrl
    authorId
    createdAt
    updatedAt
    tags
    likes {
      username
    }
    comments {
      username
      content
    }
    userDetail {
      _id
      username
    }
  }
}
```

---

### 7. Get Post By Id

```graphql
query {
  getPostById(postId: "123") {
    _id
    content
    imgUrl
    authorId
    createdAt
    updatedAt
    tags
    likes {
      username
    }
    comments {
      username
      content
    }
  }
}
```

---

### 8. Add Post

```graphql
mutation {
  addPost(
    content: "Hello World!"
    imgUrl: "https://example.com/image.jpg"
    tags: ["greeting", "firstpost"]
  ) {
    _id
    content
    imgUrl
    tags
    createdAt
    updatedAt
  }
}
```

---

### 9. Comment on Post

```graphql
mutation {
  commentPost(postId: "123", content: "Nice post!") {
    username
    content
    createdAt
  }
}
```

---

### 10. Like Post

```graphql
mutation {
  likePost(postId: "123") {
    postId
    username
    createdAt
  }
}
```

---

### 11. Follow User

```graphql
mutation {
  followUser(followingId: "2") {
    followingId
  }
}
```

---

## Global Errors

```json
{
  "errors": [{ "message": "You must be logged in" }]
}
```

```json
{
  "errors": [{ "message": "Invalid token" }]
}
```

```json
{
  "errors": [{ "message": "User not found" }]
}
```

```json
{
  "errors": [{ "message": "You are already following this user" }]
}
```

```json
{
  "errors": [{ "message": "Internal server error" }]
}
```
