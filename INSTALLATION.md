# Installation & Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Create the Database
```bash
npx prisma migrate dev --name init
```
This will create the SQLite database and tables.

### Step 3: Start the Dev Server
```bash
npm run dev
```

### Step 4: Open in Browser
Visit: **http://localhost:3000**

---

## What You Can Do Now

### Account Setup
1. Click "Sign Up" on the home page
2. Create an account (email: test@example.com, password: password123)
3. Login with your credentials

### After Login
You'll see the **Dashboard** with:
- ✅ Metrics showing: Requests today, Quotes pending, Quotes sent, Tasks today
- ✅ Quick action buttons
- ✅ Links to browse customers, quotes, jobs, invoices

### Try These Features

**1. Create a Customer**
- Click "New Customer" or go to Customers page
- Fill in name, phone, address
- See it in the customer list

**2. Create a Request**
- Click "New Request"
- Select a customer
- Enter request title, description
- **REQUIRED**: Date and time for the assessment
- Save it

**3. Create a Quote** (from the API - UI coming next)
- The quote API is ready! You can:
  - Add products from the Products library
  - Set prices, discounts, tax
  - Auto-calculated totals

**4. Approve Quote → Create Job** (API ready)
- When quote is approved, it auto-creates a job
- Job gets added to calendar

**5. Complete Job → Create Invoice** (API ready)
- When job is done, convert it to invoice
- Invoice includes all items from the quote

**6. Add Tasks** (API ready)
- Create daily tasks
- Mark them complete

---

## Available Pages (Built)

✅ **Fully Functional:**
- / - Landing page
- /auth/signup - Sign up
- /auth/login - Login
- /dashboard - Dashboard with metrics
- /customers - List all customers
- /customers/new - Create new customer

🔧 **APIs Ready (UI coming next):**
- All CRUD operations for: Customers, Products, Requests, Quotes, Jobs, Invoices, Tasks, Calendar

---

## Environment Variables

The `.env.local` file is already set up with:
- SQLite database (local file-based)
- NextAuth configuration
- Placeholder Stripe keys
- Placeholder Google Maps key
- Email configuration (optional)

**To configure later:**
- Get Google Places API key: https://console.cloud.google.com/
- Get Stripe keys: https://dashboard.stripe.com/
- Email SMTP settings (Gmail, SendGrid, etc.)

---

## Common Commands

```bash
# Start development server
npm run dev

# View the database
npx prisma studio

# Create a new migration
npx prisma migrate dev --name <description>

# Reset database (warning: deletes data)
npx prisma migrate reset

# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

### "Cannot find module" errors
→ Run `npm install` again

### Database errors
→ Run `npx prisma migrate reset`

### Port 3000 already in use
→ Use a different port: `npm run dev -- -p 3001`

### Can't login
→ Make sure you signed up first and used correct email/password

---

## What's Next (Phase 2)

The foundation is complete! Next we'll build:

1. **Products page** - Create/manage product library with prices
2. **Requests page** - Create and manage customer requests
3. **Quotes page** - Create, manage, and send quotes
4. **Jobs page** - Track job status, completion
5. **Invoices page** - Send invoices and track payments
6. **Tasks page** - Daily task management
7. **Schedule/Calendar** - List view of jobs and tasks
8. **Integrations:**
   - Google Maps API for address autocomplete
   - Email sending for quotes/invoices
   - Stripe payment links
   - PDF generation

---

## Project Structure

```
app/
├── (auth)/              # Auth pages
├── dashboard/           # Main dashboard
├── customers/           # Customer pages (list, new, detail)
├── products/            # Products library (API ready, UI coming)
├── quotes/              # Quotes pages (API ready, UI coming)
├── jobs/                # Jobs pages (API ready, UI coming)
├── invoices/            # Invoices pages (API ready, UI coming)
├── tasks/               # Tasks pages (API ready, UI coming)
├── schedule/            # Calendar/Schedule view (coming)
└── api/                 # All API endpoints (✅ COMPLETE)

components/
├── Navigation.tsx       # Navigation & Bottom tabs
└── More coming...

lib/
├── db.ts               # Database client
└── More coming...
```

---

## Need Help?

Refer to:
- `README.md` - Project overview
- `BUILD_PROGRESS.md` - What's been completed
- `INSTALLATION.md` - This file
- API endpoints are documented in code comments

---

## Ready to Continue?

Once you run `npm install` and start the dev server, let me know and I'll continue building:
- UI pages for Products, Quotes, Jobs, Invoices
- Search functionality
- Google Maps & Stripe integrations
- Email templates
- PDF generation

Good luck! 🚀
