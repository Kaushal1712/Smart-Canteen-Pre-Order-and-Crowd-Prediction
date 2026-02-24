# Smart Canteen — Pre-Order and Crowd-Aware Seat Booking

Smart Canteen is a full-stack Next.js + Supabase web app for college canteens that lets students:

- View live seat availability (table + seat level)
- Reserve seats for dine-in (with timed hold)
- Place takeaway or dine-in food pre-orders
- Customize menu items and manage a cart
- Complete simulated checkout/payment
- Track active order lifecycle on dashboard
- Release seats manually or automatically via expiry logic

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Supabase (Auth + Postgres + RLS + Realtime + RPC)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.local.example .env.local
```

3. Fill in Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. In Supabase SQL Editor, run:

- `supabase/schema.sql`
- `supabase/seed.sql`

5. Enable Realtime replication for:

- `seat_bookings`
- `orders`

6. Start development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Main Routes

- `/` — Landing page
- `/login`, `/signup` — Auth
- `/dashboard` — Active order + progress + quick actions
- `/canteen` — Live map + seat hold
- `/menu` — Menu browsing + customization + cart
- `/checkout` — Summary + simulated payment
- `/orders` — Order history + timeline
- `/profile` — User profile + preferences

## Notes

- Seat booking race conditions are handled via Supabase RPC (`hold_seat`).
- Seat hold is 5 minutes before checkout; occupied seats expire via booking expiry logic.
- Payment is simulated in v1 (no external payment gateway).
- Authentication is currently in placeholder mode (`AUTH_PLACEHOLDER_MODE = true` in `lib/config.ts`) so you can access protected pages during development.
