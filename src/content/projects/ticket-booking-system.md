---
slug: ticket-booking-system
summary: How a C++17 ticket booking platform handles seat holds, concurrent bookings and waitlist offers on SQLite.
---

## Overview

A movie and concert ticket booking platform with a C++17 backend built on the
Crow web framework and SQLite, and a single-page frontend in plain HTML, CSS
and JavaScript. Customers pick seats on a seat map, hold them, and confirm the
booking; organisers create events; admins build venue layouts.

## Architecture

The frontend talks to the Crow HTTP server over a JSON REST API. The server is
split into a few focused modules.

| Module | Responsibility |
| --- | --- |
| `main.cpp` | Crow routes, seed data and the background maintenance thread |
| `db.cpp` | RAII wrapper around SQLite |
| `db_booking_service.cpp` | Database-backed booking, waitlist and cascade logic |
| `booking_service.cpp` | In-memory booking service |
| `auth.cpp` | JWT issue/verify and password hashing with OpenSSL |
| `email.cpp` | Transactional email through the SendGrid REST API |

Data lives in ten tables: `users`, `venues`, `venue_seats`, `events`,
`event_prices`, `event_seats`, `bookings`, `booking_seats`,
`waitlist_entries` and `waitlist_offers`.

## Seat holds

Selecting a seat places a temporary hold with a configurable time-to-live
(`HOLD_TTL_SECONDS`, ten minutes by default). The seat's row in `event_seats`
is marked `held` with an expiry timestamp. A dedicated background thread runs
every five seconds, returns expired holds to `available` and clears the
holder, so an abandoned checkout cannot block a seat indefinitely. The seat
map in the browser refreshes by polling every five seconds.

## Preventing double-booking

Holds and confirmations run inside SQLite `BEGIN IMMEDIATE` transactions and
use conditional updates, so the availability check and the write are a single
atomic statement:

```sql
UPDATE event_seats SET status = 'held'
WHERE status = 'available' AND seat_id = ?;
```

If two customers try to take the same seat at the same moment, only one update
changes the row; the other request gets an availability error. The database
runs in WAL mode for better concurrent read performance.

## Waitlist cascade

For a sold-out category, customers can join a first-in, first-out waitlist
kept per event and category. When a booking is cancelled or a hold expires,
the oldest waiting entry receives a time-limited offer by email. If the offer
expires without being accepted, the background thread marks it expired and
offers the seat to the next person in the queue.

Offer links carry a random token. The raw token is only ever sent by email;
the database stores its SHA-256 hash, and an accepted token is hashed and
compared against the stored value. Reading the database therefore does not
reveal a usable offer link.

## Authentication and roles

- JWT (HS256) is implemented directly on OpenSSL, without a third-party JWT library.
- Passwords are hashed with SHA-256 and a random 16-byte salt per user.
- Three roles: **Admin** (venue creation, event deletion, analytics),
  **Organiser** (event creation, per-event revenue and seat analytics) and
  **Customer** (browsing, booking, waitlist, managing bookings).

## Venues and events

Admins lay out a venue on a visual grid with Standard, Premium, VIP and
Disabled seat categories; disabled seats keep their grid position so the
layout shows real gaps. Organisers create events against a venue with
per-category pricing, and an event is rejected if it falls within three hours
of another event at the same venue.

## Testing

Four test suites run through CTest:

- `booking_service_tests`: in-memory hold, confirm and cancel logic
- `auth_tests`: password hashing and JWT issue/verify
- `db_booking_service_tests`: full SQLite-backed booking flows
- `email_tests`: email HTML generation and QR code URL building

## Build and deployment

The project builds with CMake 3.20+ (Crow is fetched with `FetchContent`) and
ships as a multi-stage Docker image based on Debian Bookworm, deployed on
Render.

## Limitations

Confirmation and waitlist emails may land in spam, because the sender domain
is not yet authenticated with SendGrid (SPF/DKIM).
