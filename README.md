# 🚀 Eventora — Modern Event Management & Booking Platform
> Empowering organizers and attendees through seamless event experiences.

Eventora is a full‑stack event management and ticket booking platform built with Next.js. It empowers users to discover, book, and manage events effortlessly while providing organizers and administrators with powerful dashboards for complete control.

---

## 🌟 Highlights
- Full‑stack architecture with Next.js App Router
- Secure authentication via Clerk
- Real‑time notifications and ticket generation
- Role‑based dashboards for users, organizers, and admins
- Production deployment on Vercel

---

## 🧩 Project Overview
Eventora is engineered as a production‑grade full‑stack web application to demonstrate modern web development, authentication, database management, API development, role‑based authorization, security, responsive UI design, and deployment.

The platform supports three main user roles:

- **Users** — Discover events, make bookings, pay for bookings, and access digital tickets.
- **Organizers** — Create and manage events, monitor bookings, and manage event tickets.
- **Administrators** — Manage users, organizers, events, bookings, payments, tickets, notifications, and platform analytics.

---

## ⚙️ Key Features

### User Features
- User registration and authentication  
- Browse public events  
- Search and filter events  
- View detailed event information  
- Book events  
- View booking history  
- View individual booking details  
- Simulated payment processing  
- Booking confirmation  
- Digital ticket generation & verification  
- Print digital tickets  
- Notifications & preferences  
- Responsive dashboard  

### Organizer Features
- Organizer dashboard  
- Create, edit, and delete events  
- View event statistics and bookings  
- Monitor attendee information  
- Manage tickets  
- Track event performance  

### Administrator Features
- Admin dashboard  
- User, organizer, and event management  
- Booking, payment, ticket, and notification management  
- Platform analytics  
- Role‑based access control  

---

## 🛡️ Security Features
- Authentication with Clerk  
- Role‑based authorization  
- Protected API routes  
- User & organizer ownership validation  
- Admin‑only routes  
- Input validation & invalid ID handling  
- API rate limiting with Upstash Redis  
- Protected payment operations  
- Environment variable protection  
- Generic production error responses  

---

## 🧠 Tech Stack
**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Heroicons  
**Backend:** Next.js API Routes, REST‑style endpoints, server‑side auth  
**Database:** MongoDB, Mongoose  
**Authentication:** Clerk  
**Rate Limiting:** Upstash Redis  
**Deployment:** Vercel, GitHub  

---

## 🏗️ System Architecture

User
 │
 ▼
Next.js Frontend
 │
 ├── Authentication ───────► Clerk
 │
 ├── API Requests ─────────► Next.js API Routes
 │                              │
 │                              ▼
 │                           MongoDB
 │                              │
 │                              ▼
 │                           Mongoose
 │
 └── Rate Limiting ─────────► Upstash Redis


---

## 🔐 Role‑Based Access
Role	Main Access
User	Events, bookings, payments, tickets, notifications
Organizer	Event management, bookings, tickets, statistics
Admin	Complete platform management

---

## 🧾 API Structure
Events: /api/events, /api/events/[id]

Bookings: /api/bookings, /api/bookings/[id]

Payments: /api/payments

Tickets: /api/tickets, /api/tickets/verify

Notifications: /api/notifications, /api/notifications/[id], /api/notifications/unread, /api/notifications/cleanup, /api/notifications/preferences

Organizer: /api/organizer/*

Administrator: /api/admin/*

---

🗃️ Database Models
User

Event

Booking

Payment

Ticket

Notification

---

## 🔔 Notifications
Supports:

Registration confirmation

Booking confirmation

Successful payment

Ticket generation

New booking notifications

Event updates & cancellations

Event reminders

User preferences

---

## 📱 Responsive Design
Optimized for mobile, tablet, laptop, and desktop with responsive layouts, accessible navigation, and adaptive components.

----

#🧱 Project Structure

Eventora/
├── src/
│   ├── app/
│   ├── components/
│   ├── database/
│   ├── lib/
│   └── proxy.ts
├── public/
├── .env.local
└── README.md

---

## 🧪 Testing
Flows tested: authentication, event creation, booking, payment, ticket generation, notifications, organizer/admin authorization, API validation, rate limiting, responsive layouts, and deployment.

---

## 🎓 What I Learned
Hands‑on experience with:

- Next.js App Router

- TypeScript & React

- Tailwind CSS

- MongoDB & Mongoose

- Clerk authentication

- Role‑based authorization

- REST API development

- Payment workflow design

- Digital ticket systems

- Notification systems

- API security & rate limiting

- Responsive UI/UX

- Git, GitHub, and Vercel deployment

---

## 🚀 Future Improvements
- Real M‑Pesa & card payment integration

- Email notifications

- QR‑code ticket scanning

- Event reminders

- Advanced analytics

- Organizer verification

- Image upload & cloud storage

- Automated testing

- Event reviews & ratings

---

## ⚖️ License
Created for learning, portfolio development, and demonstration of full‑stack web development skills.

Code

---

### ✅ Final Git Steps
```powershell
git add README.md
git commit -m "Update README for production portfolio"
git push
Then verify:

powershell
git status
You should see:

text
nothing to commit, working tree clean
