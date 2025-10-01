# Nike E-commerce App

A modern e-commerce application built with Next.js, TypeScript, and a comprehensive tech stack including Better Auth, Neon PostgreSQL, Drizzle ORM, and Zustand for state management.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: Better Auth
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Linting**: ESLint

## Features

- 🛍️ Product catalog with Nike items
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔐 Authentication system with Better Auth
- 🗄️ PostgreSQL database with Drizzle ORM
- 📱 State management with Zustand
- 🚀 Server-side rendering with Next.js App Router

## Setup Instructions

### 1. Environment Variables

Copy the `.env.local` file and update it with your actual values:

```bash
# Database
DATABASE_URL="your_neon_database_url_here"

# Better Auth
BETTER_AUTH_SECRET="your_secret_key_here"
BETTER_AUTH_URL="http://localhost:3000"
```

**Required Setup:**
1. Create a [Neon PostgreSQL](https://neon.tech) database and get your connection URL
2. Generate a random secret key for Better Auth (you can use `openssl rand -base64 32`)

### 2. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample Nike products
npm run db:seed
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   └── page.tsx        # Homepage
├── components/         # React components
├── lib/
│   ├── auth/          # Better Auth configuration
│   ├── db/            # Database schema and connection
│   └── store/         # Zustand stores
└── scripts/           # Database seeding scripts
```

## Database Schema

The application includes a `products` table with the following fields:
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `imageUrl` - Product image URL
- `category` - Product category
- `brand` - Product brand (defaults to Nike)
- `size` - Product size
- `color` - Product color
- `stock` - Available stock
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Verification

Repository access and CI/CD workflows have been verified.
