# Flow

A Trello-like project management app built with Next.js 16.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite via Prisma 5
- **Auth:** NextAuth.js v5 (Credentials provider, JWT sessions)
- **Drag & Drop:** @dnd-kit
- **Icons:** react-icons

## Getting Started

```bash
pnpm install
pnpm prisma db push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth

Flow uses email/password authentication. Register at `/register`, then sign in.

## Features

- Create boards with color picker backgrounds
- Add lists inline, rename or delete them, drag to reorder
- Add cards to any list, drag between lists
- Card detail modal: labels, due dates, comments, checklists (with progress)
- Editable board and list titles

## Project Structure

```
src/
  app/         Next.js App Router pages and API routes
  components/  Client components (BoardList, ListColumn, CardItem, CardModal, etc.)
  lib/         Auth and Prisma client config
prisma/
  schema.prisma  Database schema
```

## Scripts

| Command               | Description          |
| --------------------- | -------------------- |
| `pnpm dev`            | Start dev server     |
| `pnpm build`          | Production build     |
| `pnpm prisma db push` | Sync database schema |
| `pnpm prisma studio`  | Open Prisma Studio   |
