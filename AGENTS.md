# Agent Guidelines for Student API Project

## Build/Run Commands

```bash
# Development server with hot reload
deno task dev

# Database operations
deno task pv    # Prisma validate
deno task pg    # Prisma generate client
deno task pmd   # Prisma migrate dev
deno task pmr   # Prisma migrate reset
deno task pms   # Prisma migrate status

# Seed database
deno task seed
```

**Testing:** No test framework configured yet. Use Deno's built-in test runner: `deno test -A`

## Code Style

### General

- **Runtime:** Deno (not Node.js)
- **Language:** TypeScript with strict types
- **Formatter:** Use `deno fmt` before committing
- **Linter:** Use `deno lint` before committing

### Imports

- Use Deno's native import map (see `deno.json`)
- Prefer `npm:` specifiers for npm packages
- Prefer `jsr:` specifiers for standard library
- Always include `.ts` extension in local imports

### Naming Conventions

- `camelCase` for variables, functions, methods
- `PascalCase` for classes, interfaces, types
- `UPPER_SNAKE_CASE` for constants
- `kebab-case` for file names

### Error Handling

- Always validate request parameters and body
- Return appropriate HTTP status codes (400, 404, etc.)
- Use early returns with guard clauses

### Database

- Always use Prisma Client from `./generated/client.ts`
- Run `deno task pg` after schema changes
- Use transactions for multi-step operations

### API Patterns

- RESTful endpoints with proper HTTP methods
- JSON request/response bodies
- Consistent error format: `{ error: "message" }`
