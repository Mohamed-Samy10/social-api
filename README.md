# 🚀 Social Media API

A high-performance RESTful API built with **Elysia.js** and **Bun** runtime, featuring a complete social media backend with authentication, posts, nested comments, and real-time like interactions. This project demonstrates enterprise-level architecture patterns and modern TypeScript development practices.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Key Implementations](#-key-implementations)
- [Performance Optimizations](#-performance-optimizations)

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** - Secure user registration and login with bcrypt password hashing
- 📝 **Post Management** - Create and retrieve posts with author information
- 💬 **Nested Comments System** - Support for comments on posts and replies to comments (polymorphic relationships)
- ❤️ **Like System** - Like/unlike functionality for both posts and comments with duplicate prevention
- 📄 **Cursor-Based Pagination** - Efficient pagination for large datasets
- 👤 **User Context** - Personalized responses showing if current user liked items

### Technical Features
- ⚡ **Bun Runtime** - Ultra-fast JavaScript runtime (3x faster than Node.js)
- 🛡️ **Type Safety** - End-to-end TypeScript with Zod validation
- 🗄️ **Type-Safe ORM** - Drizzle ORM with PostgreSQL
- 🔒 **Authentication Middleware** - Route protection with JWT verification
- 📊 **Optimized Queries** - SQL aggregations for likes count and user-specific data
- 🎯 **Clean Architecture** - Separation of concerns with modular structure

## 🛠️ Tech Stack

| Technology | Purpose | Why Used |
|------------|---------|----------|
| **[Elysia.js](https://elysiajs.com/)** | Web Framework | Blazing fast, type-safe API framework built for Bun |
| **[Bun](https://bun.sh/)** | JavaScript Runtime | 3x faster than Node.js, built-in TypeScript support |
| **[TypeScript](https://www.typescriptlang.org/)** | Language | Type safety and better developer experience |
| **[Drizzle ORM](https://orm.drizzle.team/)** | Database ORM | Type-safe, lightweight ORM with excellent performance |
| **[PostgreSQL](https://www.postgresql.org/)** | Database | Robust relational database with advanced features |
| **[Zod](https://zod.dev/)** | Validation | Runtime type validation for API requests |
| **[JWT](https://jwt.io/)** | Authentication | Stateless authentication tokens |
| **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** | Security | Password hashing with salt |

## 🏗️ Architecture

This project follows a **modular monolithic architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│            API Layer (Routes)                │
│  - Request validation (Zod schemas)          │
│  - Response formatting                       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Business Logic (Services)            │
│  - Core business rules                       │
│  - Data transformations                      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Data Access Layer (ORM)              │
│  - Database queries (Drizzle)                │
│  - Schema definitions                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            PostgreSQL Database               │
└─────────────────────────────────────────────┘
```

### Design Patterns Used
- **Service Layer Pattern** - Business logic separated from routes
- **Middleware Pattern** - Authentication guard for protected routes
- **Repository Pattern** - Data access abstraction through Drizzle ORM
- **Dependency Injection** - Services injected into routes
- **Schema-First Design** - Database schema as single source of truth

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│    Users    │◄────────│    Posts     │
│─────────────│         │──────────────│
│ id (PK)     │         │ id (PK)      │
│ name        │         │ user_id (FK) │
│ email       │         │ content      │
│ password    │         │ created_at   │
└─────┬───────┘         └──────┬───────┘
      │                        │
      │                        │ Polymorphic
      │                        │ Relationship
      │                ┌───────▼────────┐
      │                │   Comments     │
      │                │────────────────│
      │                │ id (PK)        │
      └────────────────┤ user_id (FK)   │
                       │ content        │
                       │ commentable_id │
                       │ commentable_type (post/comment)
                       └───────┬────────┘
                               │
                       ┌───────▼────────┐
                       │     Likes      │
                       │────────────────│
                       │ id (PK)        │
                       │ user_id (FK)   │
                       │ likeable_id    │
                       │ likeable_type (post/comment)
                       └────────────────┘
```

### Key Schema Features
- **Polymorphic Relationships** - Comments and likes can belong to posts or other comments
- **Unique Constraints** - Prevent duplicate likes (user + likeable_id + likeable_type)
- **Indexes** - Optimized queries on frequently searched columns
- **Timestamps** - Track creation and update times

## 📡 API Endpoints

### Authentication (Public)
```http
POST   /api/v1/auth/register     # Register new user
POST   /api/v1/auth/login        # Login user
```

### Posts (Protected)
```http
GET    /api/v1/posts              # List posts with pagination
GET    /api/v1/posts/:postId      # Get single post
POST   /api/v1/posts              # Create new post
```

### Comments (Protected)
```http
GET    /api/v1/posts/:postId/comments           # Get post comments
POST   /api/v1/posts/:postId/comments           # Comment on post
GET    /api/v1/comments/:commentId/replies      # Get comment replies
POST   /api/v1/comments/:commentId/replies      # Reply to comment
```

### Likes (Protected)
```http
POST   /api/v1/posts/:postId/likes              # Like a post
DELETE /api/v1/posts/:postId/likes              # Unlike a post
POST   /api/v1/comments/:commentId/likes        # Like a comment
DELETE /api/v1/comments/:commentId/likes        # Unlike a comment
```

### Request/Response Examples

#### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

# Response
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "meta": null,
  "errors": null
}
```

#### Get Posts with Pagination
```bash
GET /api/v1/posts?limit=10&cursor=2024-01-10T12:00:00Z|5
Authorization: Bearer <token>

# Response
```
{
"data": [
    {
        "id": 20,
        "content": "Hello World",
        "createdAt": "2026-01-09T18:11:54.515Z",
        "author": {
            "id": 4,
            "name": "Muhammad Samy"
        },
        "likesCount": "0",
        "isLiked": false
    }
],
"meta": {
    "limit": 1,
    "cursor": "2026-01-09T18:11:54.515Z|20"
},
"errors": null
}
```

## 🚀 Installation

### Prerequisites
- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))
- **PostgreSQL** >= 14.0
- **Git**

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd social-api
```

2. **Install dependencies**
```bash
bun install
```

3. **Set up PostgreSQL database**
```bash
# Create database
createdb social_db

# Or using psql
psql -U postgres
CREATE DATABASE social_db;
```

4. **Configure environment variables**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your credentials
```

5. **Run database migrations**
```bash
bun run drizzle-kit push
```

6. **Start development server**
```bash
bun run dev
```

The API will be available at `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:1234@localhost:5432/social_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 💻 Usage

### Development
```bash
bun run dev          # Start with hot reload
```

### Testing Database Connection
```bash
bun run src/scripts/test-db.ts     # Test database connection
```

### Seeding Data
```bash
bun run src/scripts/seed.ts        # Seed database with sample data
```

## 📁 Project Structure

```
social-api/
├── src/
│   ├── config/              # Configuration files
│   │   ├── auth.ts          # JWT configuration
│   │   ├── db.ts            # Database connection
│   │   └── env.ts           # Environment validation
│   │
│   ├── db/
│   │   └── schema/          # Database schema definitions
│   │       ├── users.ts     # User table schema
│   │       ├── posts.ts     # Posts table schema
│   │       ├── comments.ts  # Comments table schema (polymorphic)
│   │       ├── likes.ts     # Likes table schema (polymorphic)
│   │       └── index.ts     # Schema exports
│   │
│   ├── modules/             # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.routes.ts    # Auth endpoints
│   │   │   ├── auth.service.ts   # Auth business logic
│   │   │   ├── auth.schema.ts    # Validation schemas
│   │   │   └── auth.guard.ts     # JWT middleware
│   │   │
│   │   ├── posts/
│   │   │   ├── posts.routes.ts   # Post endpoints
│   │   │   ├── posts.service.ts  # Post business logic
│   │   │   └── posts.schema.ts   # Validation schemas
│   │   │
│   │   ├── comments/
│   │   │   ├── comments.routes.ts   # Comment endpoints
│   │   │   └── comments.service.ts  # Comment business logic
│   │   │
│   │   └── likes/
│   │       ├── likes.routes.ts   # Like endpoints
│   │       └── likes.service.ts  # Like business logic
│   │
│   ├── utils/               # Utility functions
│   │   ├── jwt.ts           # JWT helpers
│   │   └── response.ts      # Response formatters
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── elysia.d.ts
│   │
│   ├── scripts/             # Utility scripts
│   │   ├── seed.ts          # Database seeding
│   │   └── test-db.ts       # Database testing
│   │
│   ├── app.ts               # App configuration
│   └── server.ts            # Server entry point
│
├── drizzle/                 # Database migrations
├── drizzle.config.ts        # Drizzle configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔑 Key Implementations

### 1. Authentication Middleware
```typescript
// JWT-based authentication guard
export const authGuard = new Elysia()
  .derive({ as: 'scoped' }, ({ headers }) => {
    const token = headers.authorization?.replace('Bearer ', '');
    const payload = verifyToken(token);
    return { user: { id: payload.userId } };
  });
```

**Why it matters**: Demonstrates understanding of middleware patterns and security best practices.

### 2. Polymorphic Relationships
```typescript
// Comments can belong to posts OR other comments
{
  commentableId: integer('commentable_id').notNull(),
  commentableType: varchar('commentable_type', { length: 20 }).notNull()
}
```

**Why it matters**: Shows advanced database design skills for flexible data modeling.

### 3. Cursor-Based Pagination
```typescript
// Efficient pagination using timestamp + id
const cursor = `${lastItem.createdAt.toISOString()}|${lastItem.id}`;
```

**Why it matters**: Better performance for large datasets compared to offset pagination.

### 4. Optimized SQL with Aggregations
```typescript
// Single query with joins and aggregations
.select({
  id: posts.id,
  content: posts.content,
  likesCount: sql<number>`count(${likes.id})`,
  isLiked: sql<boolean>`bool_or(${likes.userId} = ${currentUserId})`
})
.leftJoin(likes, ...)
.groupBy(posts.id)
```

**Why it matters**: Reduces N+1 query problems and improves API performance.

### 5. Type-Safe Validation
```typescript
// Request validation with Zod
body: t.Object({
  content: t.String({ minLength: 1, maxLength: 500 })
})
```

**Why it matters**: Prevents invalid data at runtime while maintaining type safety.

## ⚡ Performance Optimizations

### 1. **Bun Runtime**
- 3x faster startup than Node.js
- Built-in TypeScript transpilation
- Native web APIs support

### 2. **Database Indexes**
- Unique index on `users.email` for fast lookups
- Composite index on likes for duplicate prevention
- Index on `likeable_id + likeable_type` for polymorphic queries

### 3. **Query Optimization**
- Single query with joins instead of multiple queries
- SQL aggregations for counting likes
- Cursor-based pagination for large datasets

### 4. **Connection Pooling**
- PostgreSQL connection pool for efficient database connections
- Reduces connection overhead

## 🎯 Skills Demonstrated

### Backend Development
✅ RESTful API design  
✅ Authentication & Authorization  
✅ Database schema design  
✅ SQL query optimization  
✅ Pagination strategies  
✅ Simple Error handling  

### TypeScript/JavaScript
✅ Advanced TypeScript patterns  
✅ Type-safe ORM usage  
✅ Async/await patterns  
✅ ES2022+ features  

### Architecture
✅ Modular architecture  
✅ Separation of concerns  
✅ Middleware patterns  
✅ Service layer pattern  

### Database
✅ PostgreSQL  
✅ Relational database design  
✅ Complex joins  
✅ Polymorphic relationships  
✅ Indexing strategies  

## 🚦 Health Check

```bash
GET /api/v1/health

# Response
{ "status": "ok" }
```

## 📈 Future Enhancements

- [ ] Rate limiting
- [ ] Apply zod validation for all modules not just Auth
- [ ] Improve error handling
- [ ] Soft deletes
- [ ] User profiles and follow system
- [ ] API documentation with Swagger


## 👤 Author

- GitHub: [@Mohamed-Samy10](https://github.com/Mohamed-Samy10)

---