# AGENTS.md

This file contains guidelines for agentic coding agents working in this repository.

## Project Overview

This is a T3 Stack application (Next.js 15, TypeScript, tRPC, Tailwind CSS, Prisma, NextAuth). Uses PostgreSQL database.

## Commands

### Build & Quality Checks
- `pnpm build` - Build Next.js application
- `pnpm check` - Run lint + typecheck (comprehensive check)
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format:check` - Check Prettier formatting
- `pnpm format:write` - Apply Prettier formatting
- `pnpm typecheck` - Run TypeScript type checking

### Development
- `pnpm dev` - Start dev server with Turbo
- `pnpm preview` - Build and start production server

### Database (Prisma)
- `pnpm db:generate` - Generate Prisma client and run migrations
- `pnpm db:migrate` - Deploy migrations (production)
- `pnpm db:push` - Push schema changes directly to database
- `pnpm db:studio` - Open Prisma Studio

### Testing
No test framework configured. Test manually via dev server.

## Code Style Guidelines

### TypeScript & Type Safety
- Strict mode enabled with `noUncheckedIndexedAccess` (always check for undefined)
- Use `@/*` path alias for src/ directory imports
- Use `server-only` package for server-only code to prevent accidental client imports
- Avoid `any` - use proper types or `unknown`
- Use `??` for null coalescing, not `||`

### Imports
- Use inline type imports: `import type { X } from "..."` and `import { type Y } from "..."`
- Use absolute imports with `@/*` alias: `import { db } from "@/server/db"`
- React imports: `import { useState } from "react"`
- Place type imports first, then regular imports

### Naming Conventions
- Files: kebab-case or camelCase (e.g., `post.tsx`, `auth-config.ts`)
- Components: PascalCase (e.g., `LatestPost`, `HydrateClient`)
- Functions/variables: camelCase (e.g., `createCaller`, `createQueryClient`)
- Database models: PascalCase (e.g., `User`, `Post`, `Account`)

### React & Next.js
- Use Server Components by default, add `"use client"` directive for client components
- Use `async/await` for data fetching in Server Components
- Use tRPC for API calls with `api.post.hello.query()` or `api.post.create.mutate()`
- Prefetch tRPC queries with `api.post.getLatest.prefetch()` before rendering
- Define functions outside JSX, avoid inline callbacks
- Use Tailwind CSS for styling with utility classes

### tRPC
- Define procedures in `src/server/api/routers/*.ts`
- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints (requires session)
- Validate inputs with Zod: `.input(z.object({ text: z.string() }))`
- Access database via `ctx.db` and session via `ctx.session`

### Prisma
- Generated client at `generated/prisma/` (excluded from tsconfig)
- Use global singleton pattern (see `src/server/db.ts`)
- Query results can be null - handle with `??` operator
- Use `findFirst` for single results, return `post ?? null` pattern

### NextAuth
- Auth config in `src/server/auth/config.ts`
- Extend session types with module augmentation
- Access session via `await auth()` in Server Components

### Error Handling
- Always handle null/undefined from Prisma queries
- Use Zod for runtime input validation
- Use `try/catch` around database operations when appropriate

### Formatting
- Prettier with `prettier-plugin-tailwindcss` (sorts Tailwind classes)
- Run `pnpm format:write` before committing
- No trailing commas, standard indentation

## Workflow

When making changes:
1. Run `pnpm lint:fix` and `pnpm format:write` to auto-fix issues
2. Run `pnpm typecheck` to ensure type safety
3. Run `pnpm check` for comprehensive validation
4. Test changes in dev server

Important:
- Never run `pnpm db:push` in production - use migrations
- Generated Prisma client changes are not committed (generated/ excluded)
- Always run typecheck before committing
