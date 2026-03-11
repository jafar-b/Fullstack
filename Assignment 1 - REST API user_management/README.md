# User Management REST API

Assignment Screenshots are available in the PDF below.

📄 [ASSIGNMENT 1.pdf](https://github.com/user-attachments/files/25733434/ASSIGNMENT.1.pdf)


This project implements a **User Management REST API** using **NestJS** following proper REST architecture principles including correct HTTP methods and status codes.

---

# API Status Code Demonstrations

This API demonstrates how different HTTP status codes work through dedicated routes.

---

## GET Route (200 OK)

This route retrieves data successfully from the server.

Example endpoint:

```
GET /api/v1/users
```

Response:

```
200 OK
```

Description:

Returns a list of users stored in the database.

---

## POST Route (200 OK)

This route processes a POST request successfully.

Example endpoint:

```
POST /api/v1/users
```

Response:

```
200 OK
```

Description:

Processes the request and returns a successful response.

---

## PUT Route (200 OK)

This route updates an entire user resource.

Example endpoint:

```
PUT /api/v1/users/:id
```

Response:

```
200 OK
```

Description:

Replaces the existing user information with the provided data.

---

## PATCH Route (200 OK)

This route performs a partial update of a user resource.

Example endpoint:

```
PATCH /api/v1/users/:id
```

Response:

```
200 OK
```

Description:

Updates specific fields of a user instead of replacing the entire record.

---

## DELETE Route (204 No Content)

This route deletes a user successfully.

Example endpoint:

```
DELETE /api/v1/users/:id
```

Response:

```
204 No Content
```

Description:

The user is deleted successfully and the server returns no response body.

---

## 503 Service Unavailable Route (GET)

Example endpoint:

```
GET /service-unavailable
```

Response:

```
503 Service Unavailable
```

Description:

This route simulates a server being temporarily unavailable.

---

## 429 Too Many Requests Route (GET)

Example endpoint:

```
GET /api/v1/users
```

Description:

If more than **100 requests are sent within one minute**, the API returns:

```
429 Too Many Requests
```

This is implemented using **NestJS rate limiting (ThrottlerModule)**.

---

## 201 Created Route (POST)

Example endpoint:

```
POST /api/v1/users
```

Response:

```
201 Created
```

Description:

Returned when a new user is successfully created.

---

## 401 Unauthorized Route

Example endpoint:

```
GET /api/v1/protected
```

Response:

```
401 Unauthorized
```

Description:

Returned when a user tries to access a protected route without a valid authentication token.

---

## 404 Not Found Route

Example endpoint:

```
GET /api/v1/users/:id
```

Response:

```
404 Not Found
```

Description:

Returned when the requested user does not exist in the database.

---

## 400 Bad Request

Example endpoint:

```
POST /api/v1/users
```

Response:

```
400 Bad Request
```

Description:

Occurs when the client sends invalid input such as:

* Missing required fields
* Invalid email format
* Incorrect data types

---

## 422 Unprocessable Entity Route

Example endpoint:

```
POST /api/v1/users
```

Response:

```
422 Unprocessable Entity
```

Description:

The request format is correct but contains semantic errors that prevent processing.

Example cases:

* Email already exists
* Invalid business logic validation

---

# Technologies Used

* NestJS
* TypeScript
* PostgreSQL
* TypeORM
* class-validator
* Throttler (Rate Limiting)

---

# API Features

* RESTful API architecture
* Proper HTTP methods
* Correct HTTP status codes
* Input validation
* Pagination support
* Error handling
* Rate limiting
* PostgreSQL database integration


