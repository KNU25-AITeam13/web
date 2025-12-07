# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Mealog" - A nutrition analysis web application built with Next.js 16 that allows users to upload meal photos, receive AI-powered nutritional analysis via Server-Sent Events (SSE), and track their dietary intake. Features Google OAuth authentication, PostgreSQL database with Prisma ORM, and AWS S3/CloudFront for image storage.

## Common Commands

### Development
```bash
pnpm dev                    # Start development server on localhost:3000
pnpm build                  # Build for production (React Compiler enabled)
pnpm start                  # Start production server
```

### Database
```bash
npx prisma generate         # Generate Prisma client types (auto-runs on postinstall)
npx prisma migrate dev      # Create and apply migrations in development
npx prisma migrate deploy   # Apply migrations in production
npx prisma studio           # Open Prisma Studio GUI
```

### Code Quality
```bash
pnpm lint                   # Run ESLint
pnpm format                 # Format code with Prettier
pnpm format:check           # Check formatting without changes
```

## Architecture & Key Patterns

### File-Based Routing Convention

This project uses a custom naming pattern that extends Next.js App Router conventions:

- `page.tsx` → Server component for data fetching (async)
- `page.layout.tsx` → Client component for interactivity ('use client')
- `page.component.tsx` → Reusable form components

**Example**: `/register` route
- `page.tsx` - Fetches session, redirects if needed
- `page.layout.tsx` - Handles form state with React Hook Form
- `page.component.tsx` - Renders individual form steps

### Authentication Flow (Better-Auth)

Two-phase registration system:

1. **OAuth Phase**: Google login creates User with `isRegistered: false`
2. **Profile Phase**: Form collects nutrition profile (birthDate, gender, height, weight), sets `isRegistered: true`

**Middleware Protection** (`/src/proxy.ts`):
- Exports as default Next.js middleware
- Protected routes: `/my`, `/board`, `/meals/*`, `/analyze`, `/upload`
- Redirects unauthenticated → `/login`
- Redirects incomplete registration → `/register`

**Session Access**:
- Server: `auth.api.getSession({ headers })`
- Client: `useSession()` hook from `/src/lib/auth-client.ts`

### Database Schema (Prisma)

**Important**: Prisma client generates to custom location: `/src/generated/prisma`

**Key Models**:
- `User` - Extended with nutrition profile fields (`birthDate`, `gender`, `height`, `weight`, `isRegistered`)
- `Meal` - User meal records with `date`, `type`, `isPublic` flag
- `MealItem` - Individual food photos linked to Meal
- `MealItemAnalysis` - AI analysis results with comprehensive nutrition data (15+ fields)

**Cascade Deletes**: Deleting Meal automatically removes MealItems and MealItemAnalysis via `onDelete: Cascade`

### API Patterns

All API routes follow this structure:
1. Session validation via `auth.api.getSession()`
2. User lookup in database
3. Request validation with Zod schemas
4. Database operations
5. JSON response

**Critical SSE Pattern** (`/api/analyze`):
- Uses Server-Sent Events for real-time AI analysis streaming
- Max duration: 300 seconds (set in route config)
- Flow: Fetch image from CloudFront → Stream to external AI service → Parse SSE → Save to DB on completion
- Content-Type: `text/event-stream`

### Image Upload & Storage

**AWS S3 Configuration**:
- Region: `ap-northeast-2` (Seoul)
- Bucket: `mealog`
- Path pattern: `images/{uuid}.{ext}`
- CloudFront CDN: `https://d2jlsmqoxhxdma.cloudfront.net`

**Upload Flow**:
1. Client validates via `uploadSchema` (max 6 images)
2. POST FormData to `/api/upload`
3. Server generates UUIDs, uploads to S3 using `PutObjectCommand`
4. Creates Meal + MealItem records
5. Returns Meal object

**Image URL Helper** (`/src/lib/s3Client.ts`):
- `getImageUrl(imageName)` prefers CloudFront if `NEXT_PUBLIC_CLOUDFRONT_URL` is set
- Fallback to direct S3 URL

### TypeScript Configuration

- Path alias: `@/*` maps to `./src/*`
- React Compiler enabled in Next.js config
- Strict mode enabled
- ESLint configured with `@typescript-eslint/no-explicit-any: off`

## Environment Variables

Required for development:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication (Better-Auth)
BETTER_AUTH_SECRET=<random-secret>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>

# External AI Service
AI_API_URL=https://ai.mealog.arpaap.dev

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
AWS_S3_BUCKET_NAME=mealog

# CDN (optional, recommended for performance)
NEXT_PUBLIC_CLOUDFRONT_URL=https://d2jlsmqoxhxdma.cloudfront.net
```

## Important Implementation Details

### Server vs Client Components

Strict separation:
- Server components (default) for database queries, session checks
- Client components marked with `'use client'` for forms, state, interactions
- Avoid mixing - pass data as props from server → client

### Form Handling

Standard pattern using React Hook Form:
```typescript
const form = useForm<SchemaType>({ resolver: zodResolver(schema) });
<FormProvider {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
```

### Real-time Features

When implementing SSE streams:
- Use `ReadableStream` and `TransformStream`
- Set appropriate headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`
- Configure route with `maxDuration` in route segment config
- Parse event data line by line

### S3 Permissions

IAM user needs:
- `s3:PutObject` to `arn:aws:s3:::mealog/images/*`
- `s3:GetObject` for analysis endpoint to fetch images

### Database Migrations

When modifying schema:
1. Edit `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive-name`
3. Prisma client auto-regenerates to `/src/generated/prisma`
4. Import from `@/generated/prisma` in code

## Project Structure

```
/src
  /app                     # Next.js App Router (routes)
  /components              # Reusable UI components
  /lib                     # Core utilities (auth, db, s3)
  /constants              # Static data (links, etc.)
  /assets                 # Images and static resources
  /generated/prisma       # Auto-generated Prisma types (DO NOT EDIT)
  proxy.ts                # Next.js middleware

/prisma
  schema.prisma           # Database schema
  /migrations             # Migration files
```

## Technology Stack

- **Framework**: Next.js 16 with App Router, React 19, React Compiler
- **Database**: PostgreSQL with Prisma ORM (adapter: @prisma/adapter-pg)
- **Auth**: Better-Auth 1.4.5 with Google OAuth
- **Storage**: AWS S3 + CloudFront
- **Styling**: Tailwind CSS v4
- **UI Components**: Headless UI (@headlessui/react)
- **Forms**: React Hook Form + Zod validation
- **Animation**: Framer Motion
- **Icons**: Tabler Icons React
- **Date**: dayjs
- **HTTP**: Axios
- **Notifications**: React Hot Toast

## Deployment (Vercel)

Build command configured in `package.json`:
```bash
prisma generate && prisma migrate deploy && next build
```

Ensures migrations run before build on Vercel.
