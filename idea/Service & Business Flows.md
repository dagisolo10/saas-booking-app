# Booking Platform Structure — Service & Business Flows

This document outlines the structure and UX flow of a booking platform supporting both **business-first** and **service-first** user journeys.  
It describes how data, navigation, and booking logic should integrate around the existing Prisma models.

---

## 🧱 Core Concept

Every booking connects a **user**, a **service**, and a **business**.

- A **Business** offers multiple **Services**
- A **Service** can be booked by multiple users
- A **User** can make multiple bookings

The backend logic (`createBooking`, `cancelBooking`, etc.) remains the same for all entry points.

---

## 🧭 Two Booking Flows

### **Flow A: Service-first**

Users start by browsing or searching for a service (e.g. “Haircut”).

```
Browse all services → Choose a service → Pick a business → Book slot
```

- Entry: `/services`
- Each card displays:
    - Service name, duration, price
    - The business offering it
    - “Book Now” button
- Clicking “Book Now” redirects to a booking page for that specific service & business.

Example Prisma query:

```ts
prisma.service.findMany({
    include: { business: { select: { id, name } } },
});
```

---

### **Flow B: Business-first**

Users start by selecting a business (e.g. “Fade Masters Barber Shop”).

```
Browse businesses → Open one → View its services → Add services → Book slot
```

- Entry: `/business/[id]`
- Page displays:
    - Business info (banner, description, working hours)
    - List of all services the business provides
    - Add-to-cart buttons for each service
    - Booking cart on the right showing:
        - Selected services
        - Total amount
        - “Continue to Booking” button

This layout creates an experience similar to marketplace-style platforms.

---

## 🧮 Booking Flow (Unified)

Both flows converge at a single booking process:

1. Choose date & time (validated by business hours)
2. Confirm booking → calls your `createBooking()` action
3. Automatic checks:
    - Business open hours
    - No conflicting bookings
    - Enough service duration time
4. Booking stored in UTC for consistency

---

## 🧩 Recommended Schema Additions

Add richer details to `Business` for better front-end display:

```prisma
model Business {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  location    String?
  phone       String?
  bannerImage String?
  rating      Float?   @default(0)
  reviewCount Int?     @default(0)
  hours       Json
  ownerId     String
  owner       User     @relation("UserBusinesses", fields: [ownerId], references: [id])
  services    Service[]
}
```

---

## 🧭 Page Architecture Overview

| Page                 | Description                                   | Path             |
| -------------------- | --------------------------------------------- | ---------------- |
| **Customer Landing** | Explore both businesses and services          | `/customer`      |
| **All Services**     | Displays every service across all businesses  | `/services`      |
| **Business Profile** | Shows business details, services, and cart    | `/business/[id]` |
| **Checkout**         | Confirms selected services, time, and payment | `/book`          |

---

## 🧱 Frontend Implementation Tips

### **Business Page**

- Fetch business + its services:
    ```ts
    prisma.business.findUnique({
        where: { id },
        include: { services: true },
    });
    ```
- Render:
    - Header with name, rating, open hours
    - “About” section
    - List of service cards with add/remove buttons
    - Right-side cart (total + booking CTA)

### **Service Page**

- Show all services with business link.
- Optionally filter by category, rating, or price.

---

## ✅ Summary

- Both “Service-first” and “Business-first” flows are supported.
- `Business` is the anchor of the ecosystem.
- `Service` remains the unit of booking.
- Backend stays consistent — only the UX context changes.
- Add `rating`, `reviewCount`, and `totalBooked` for dynamic sorting and credibility.

---

## 💡 Next Step

Design the **Business Details Page**:

- Left: business info and service list
- Right: dynamic booking cart
- Use the same `createBooking` logic behind the scenes
