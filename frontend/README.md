# HarBaat AI — Frontend

AI-powered meeting transcription and analysis platform. Upload audio recordings and receive transcripts, speaker diarization, entity extraction, RAG-powered chat, conflict detection, and knowledge graph visualizations.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **Auth**: NextAuth.js with JWT strategy + credentials provider
- **State**: TanStack Query for server state management
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Create `.env.local`** in the project root:

   ```env
   AUTH_SECRET=<your-secret>          # Generate with: npx auth secret
   NEXT_PUBLIC_API_URL=https://asim-ai.duckdns.org
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Dashboard route group
│   │   ├── dashboard/       # Upload page (new meeting)
│   │   ├── meetings/        # Meetings list + detail pages
│   │   ├── projects/        # Projects list + detail pages
│   │   ├── settings/        # Settings + known speakers
│   │   └── layout.tsx       # Dashboard layout (sidebar + main)
│   ├── (auth)/              # Auth pages (login, signup, etc.)
│   └── page.tsx             # Landing page
├── components/
│   ├── layout/              # Sidebar, Navbar, NavbarWrapper
│   ├── meetings/            # MeetingCard, StatusBadge, TranscriptViewer, etc.
│   ├── projects/            # ProjectCard
│   ├── landing/             # Landing page sections
│   └── ui/                  # shadcn/ui primitives
├── hooks/                   # TanStack Query hooks (useMeetings, useProjects, etc.)
├── lib/
│   ├── api/                 # API client and endpoint functions
│   ├── config/              # API configuration
│   ├── constants.ts         # App constants
│   └── utils/               # Utility functions (date formatting, etc.)
├── types/                   # TypeScript type definitions
├── contexts/                # React contexts (MobileMenu)
├── auth.ts                  # NextAuth configuration
└── middleware.ts            # Route protection middleware
```

## Design System

The dashboard follows a **Linear / Vercel / Resend** inspired aesthetic:

- **Color system**: oklch CSS variables with full light/dark mode via `globals.css`
- **Semantic tokens**: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`
- **Active states**: Left border accent (`border-l-2 border-primary bg-primary/10`)
- **Depth**: Border + background layering instead of drop shadows
- **Spacing**: Consistent 4px/8px rhythm

### Key UI Components

| Component       | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| **Sidebar**     | Fixed 64-wide nav with logo, section labels, left-border active states, user avatar menu |
| **Navbar**      | Sticky breadcrumb navigation with Search, Notifications, Help icons                      |
| **StatusBadge** | Colored dot + pill badge for meeting statuses (queued/processing/completed/error)        |
| **MeetingCard** | Row-based list item with status dot, metadata, hover chevron                             |
| **ProjectCard** | Card with folder icon, hover glow, meeting count footer                                  |
| **Dashboard**   | Two-column layout: "How it works" panel + drag-and-drop upload form                      |

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start dev server (Turbopack) |
| `npm run build` | Production build             |
| `npm run start` | Start production server      |
| `npm run lint`  | Run ESLint                   |
| `npm run test`  | Run Jest tests               |

## Deployment

Deploy on [Vercel](https://vercel.com) with the following environment variables:

```env
AUTH_SECRET=<your-secret>
NEXT_PUBLIC_API_URL=<your-backend-url>
```
