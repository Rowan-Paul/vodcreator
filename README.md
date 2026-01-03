# VOD Creator

A web application to generate Twitch VOD download commands for TwitchDownloaderCLI. Built with the T3 Stack (Next.js, TypeScript, tRPC, Tailwind CSS, Prisma, NextAuth).

## Features

- Add multiple Twitch channels to track
- Fetch latest VODs from Twitch API
- Generate copyable download commands for:
  - Video download
  - Chat download
  - Chat render
- Customize chat dimensions and font
- Paginated VOD loading
- Persistent storage with PostgreSQL
- Google OAuth authentication

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [tRPC](https://trpc.io) - Type-safe API
- [Prisma](https://prisma.io) - ORM
- [PostgreSQL](https://www.postgresql.org) - Database
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS v4](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google Cloud account
- Twitch Developer account

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Application type: **Web application**
6. Authorized JavaScript origins: `http://localhost:3000` (or your production URL)
7. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (or your production URL + `/api/auth/callback/google`)
8. Click **Create** to get your **Client ID** and **Client Secret**

### 2. Twitch API Setup

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click **Register Your Application**
3. Fill in the form:
   - **Name**: VOD Creator (or any name you prefer)
   - **OAuth Redirect URLs**: `http://localhost:3000` (or your production URL)
   - **Category**: Integration
4. Click **Register** to get your **Client ID** and **Client Secret**
5. Click **Manage** on your application and ensure it has the correct redirect URL

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Twitch API
TWITCH_CLIENT_ID="your-twitch-client-id"
TWITCH_CLIENT_SECRET="your-twitch-client-secret"

# NextAuth
AUTH_SECRET="generate-with: npx auth secret"

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vodcreator"
```

### 4. Database Setup

```bash
# Start your PostgreSQL database
# Using Docker:
docker run -d --name vodcreator-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=vodcreator -p 5432:5432 postgres:latest

# Or use your existing database connection string
```

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Run Migrations

```bash
pnpm db:generate
```

### 7. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to start using the app.

## Usage

1. **Sign In**: Click "Sign in with Google" and authenticate
2. **Add Channel**: Enter a Twitch username and click "Add Channel"
3. **Refresh VODs**: Click the refresh button to fetch the latest VODs from the channel
4. **Copy Commands**: Click the copy buttons to copy commands to your clipboard:
   - **Video Download**: Downloads the VOD video file
   - **Chat Download**: Downloads the chat JSON file
   - **Chat Render**: Renders the chat as a video file
5. **Load More**: Click "Load More" to fetch additional VODs from the database
6. **Settings**: Customize chat dimensions, font, and VODs per load

## Development

### Available Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate Prisma client
pnpm db:generate

# Push schema changes to database (development only)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Run type checking
pnpm typecheck

# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Format code with Prettier
pnpm format:write
```

## Deployment

### Environment Variables

Set the following environment variables in your deployment platform:

```env
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
DATABASE_URL=""
AUTH_SECRET=""
```

### Update OAuth Redirect URLs

Before deploying, update your OAuth redirect URLs:

**Google OAuth**:
- Add your production URL to authorized JavaScript origins
- Add your production URL + `/api/auth/callback/google` to authorized redirect URIs

**Twitch API**:
- Update OAuth Redirect URLs to your production URL

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com/new)
3. Add environment variables
4. Deploy

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), check out these resources:

- [Documentation](https://create.t3.gg/)
- [Learn T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)

## Troubleshooting

### Twitch API Rate Limiting

The Twitch API has rate limits (30 requests per minute). If you see rate limit errors, wait a moment before refreshing.

### Database Connection Issues

- Ensure your PostgreSQL database is running
- Check that `DATABASE_URL` is correct
- Verify your database user has the necessary permissions

### OAuth Callback Issues

- Verify your redirect URLs match exactly (including http/https)
- Check that your production URL is added to authorized origins/redirects
- Ensure your auth secret is set (`AUTH_SECRET`)

## License

MIT
