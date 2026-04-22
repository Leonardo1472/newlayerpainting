# Business Management App

A web application for managing customer estimates, quotes, jobs, invoices, and scheduling for service businesses.

## Features

- **Customer Management (CRM)** - Store and manage customer information
- **Requests** - Create customer service requests with date/time
- **Quotes** - Create and send price quotes to customers
- **Jobs** - Manage jobs created from approved quotes
- **Invoices** - Generate and send invoices, accept payments via Stripe
- **Tasks** - Daily task management
- **Calendar** - View and manage scheduled jobs and tasks
- **Dashboard** - Quick overview of key metrics

## Tech Stack

- **Frontend**: React 18 with Next.js 14
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (with Prisma ORM)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Address Lookup**: Google Places API
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Clone the repository and navigate to the project:
```bash
cd new\ layer\ web
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (copy from `.env.example` and fill in values):
```bash
cp .env.example .env.local
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Commands

- **Create new migration**: `npx prisma migrate dev --name <name>`
- **View database**: `npx prisma studio`
- **Reset database**: `npx prisma migrate reset`

## Project Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── (auth)/             # Authentication pages
├── dashboard/          # Dashboard/home after login
├── customers/          # Customer management
├── quotes/             # Quotes management
├── jobs/               # Jobs management
├── invoices/           # Invoices management
├── tasks/              # Tasks management
├── calendar/           # Calendar view
└── api/                # API routes

lib/
├── db.ts               # Prisma client
├── auth.ts             # Authentication utilities
└── validators.ts       # Form validation schemas

components/
├── layout/             # Layout components
├── forms/              # Form components
├── tables/             # Table components
└── ui/                 # Reusable UI components

prisma/
├── schema.prisma       # Database schema
└── migrations/         # Database migrations
```

## Workflow

1. **Customer calls** → Create customer in CRM
2. **Schedule site visit** → Create request with date/time
3. **Site assessment** → Convert request to quote
4. **Add items & pricing** → Build quote with line items
5. **Send quote** → Email to customer
6. **Customer approves** → Manually create job
7. **Job completed** → Create invoice
8. **Send invoice** → Customer pays via Stripe link

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with: `openssl rand -base64 32`)
- `STRIPE_SECRET_KEY` - Stripe API key for payments
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` - Google Maps API key for address lookup

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

For PostgreSQL, use Vercel Postgres or another managed database provider.

## Development Notes

- This is a single-user application (no team/multi-user support)
- All prices are calculated in USD
- SQLite is used for development, switch to PostgreSQL for production
- Email functionality requires SMTP configuration

## Support

For issues or questions, contact the development team.
