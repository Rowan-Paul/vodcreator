# ADR 0001: Enforce the tRPC server boundary at build time

- Status: accepted
- Date: 2026-08-28

## Context

After upgrading Next.js from 16.1.6 to 16.3.3, the production site broke with a
browser-side crash:

```
Uncaught Error: You're trying to use @trpc/server in a non-server environment.
This is not supported by default.
```

The cause was an import in `src/trpc/react.tsx` (a `"use client"` module):

```ts
import { type AppRouter } from "@/server/api/root";
```

`tsconfig.json` sets `verbatimModuleSyntax: true`. Under that flag, an import
statement is only erased when written as `import type { ... } from`. The inline
form above must be preserved as a bare side-effect import (`import {} from
"@/server/api/root"`), because the module could have side effects. Next 16.1's
bundler elided it anyway; Next 16.3 honours `verbatimModuleSyntax` correctly.

Preserving it dragged the whole server graph into the client bundle:
`root.ts` → `api/trpc.ts` → `initTRPC(...).create()` at module scope. tRPC v11
guards `create()` with an `isServer` check, so the chunk threw on load and the
page never hydrated. `src/server/services/twitch.ts` and the NextAuth config
were bundled too. Secret *values* did not leak — Next only inlines
`NEXT_PUBLIC_*` — but the server code shape shipped to the browser.

The failure mode is the problem: a type-level import slip produced a runtime
crash in production, with nothing failing at build or review time.

## Decision

1. Import types from server modules with `import type { ... } from`, never the
   inline `import { type ... }` form. The inline form is reserved for imports
   that genuinely mix values and types from the same module.
2. `src/server/api/trpc.ts` imports `"server-only"`. Any client module that
   reaches the tRPC server graph now fails `next build` with an explicit import
   trace instead of shipping a broken bundle. `src/trpc/server.ts` already did
   this; the router root was the missing link.

## Consequences

- The mistake class is now a build error, not a production incident.
- `src/server/api/trpc.ts` can no longer be imported from client components at
  all. That is the intent; clients go through `@/trpc/react`.
- Verify with `grep -rl "non-server environment" .next/static/` after a build —
  it must return nothing.
