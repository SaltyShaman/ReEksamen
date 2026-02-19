# 🎬 ReEksamen – Full Stack Cinema Booking App

A full-stack cinema reservation system built with **Node.js (Express)** and **SvelteKit**.  
This project lets users browse movies, view showtimes, book seats, and manage reservations.  
Admins can manage movies, showtimes, halls, and user accounts.

---

## 🚀 Features

### ✅ User Features
- Browse all movies and showtimes
- Create user account
- Delete user account including reservations
- Login / Logout
- Basic change password --> no instructions on how to do with email or sms code
- Book reservations per showtime
- Group based reservation i.e 5 seats one reservation
- View and update own reservations

### 🔐 Admin Features
- Create, delete movies
- Create, delete showtimes
- Create, delete halls
- View and delete all reservations
- Update seat availability per hall
- Can delete non-admins

---

## 🛠️ Tech Stack

- sqlite3
- open source Node js security
- SvelteKit SSR

---

## 📁 Repository Structure

```text
ReEksamen/
├── backend/        # Express server + REST API + backend sockets
├── frontend/       # SvelteKit frontend
├── .gitignore
└── README.md


## KNOWN BUGS:
- admin self delete -> on the frontend it looks like you can delete your own user as admin
- create hall: If the seat amount is too big it will take a while to create the hall without showing proper feedback
- if you restart the server and you are not properly logged out it can treat you as being logged in in header section