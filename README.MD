# 🎬 ReEksamen – Full Stack Cinema Booking App

A full-stack cinema reservation system built with **Node.js (Express)** and **SvelteKit**.  
This project lets users browse movies, view showtimes, book seats, and manage reservations.  
Admins can manage movies, showtimes, halls, and user accounts.

---

## 🚀 Features

### 👤 User Features
- Browse all movies and showtimes
- Create and delete user account (deletes associated reservations)
- Login / Logout
- Basic password change functionality
(No email/SMS verification implemented)
- Book reservations per showtime
- Group-based reservations (multiple seats under one reservation)
- View, update, and cancel own reservations

### 🔐 Admin Features
- Create and delete movies
- Create and delete showtimes
- Create, update and  delete halls
- Update seat status per hall (AVAILABLE, BROKEN, MAINTENANCE)
- View and delete all reservations
- Update seat availability per hall
- Can delete non-admins

---

## 🛠️ Tech Stack

- Backend: Node.js (Express)
- Database: SQLite3
- Frontend: SvelteKit (SSR enabled)
- Real-time Updates: Socket.IO
- Authentication: Session-based authentication
- Security: Open-source Node.js security middleware

The architecture follows a clear client-server model with REST APIs and WebSocket communication for real-time updates. Data integrity is enforced at the database level, while authentication and authorization are handled via middleware.


---

## 📁 Repository Structure

```
ReEksamen/
├── backend/        # Express server + REST API + backend sockets
├── frontend/       # SvelteKit frontend
├── .gitignore
└── README.md

```




## KNOWN BUGS:
- Admin Self-Delete:
The UI currently allows an admin to attempt deleting their own account (should be restricted)
- create hall: 
Creating a hall with a large number of seats can take noticeable time without proper loading feedback.
- Session Inconsistency After Restart:
If the backend server restarts while a user is logged in, the frontend header may temporarily treat the user as authenticated until refresh.