# 🛡️ AvengersNexus

AvengersNexus is a full-stack web application built using the **MERN stack** (MongoDB, Express, React, Node.js). It offers a dynamic platform featuring user authentication, attendance tracking, mission creation, real-time chat, reward distribution, admin and client dashboards, mailing features, and more.

## 🚀 Tech Stack

- **Frontend**: React.js, Redux, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Others**: Redis (for sessions/OTP), Nodemailer (mailing), JWT (auth), Multer (file uploads)

---

## 📌 Features

### ✅ Authentication
- JWT-based authentication
- Role-based access control (Admin / Client)
- OTP verification (with email)
- .ahduni.edu.in domain-based signup (for college-specific login)

### 👨‍💼 Admin Dashboard
- View and manage users
- Create and assign missions
- Monitor attendance
- Distribute rewards
- Review feedback and user statistics

### 👤 Client Dashboard
- View assigned missions
- Mark attendance via OTP system
- Submit posts and feedback
- Earn and view rewards
- Engage in real-time chats with team/admin

### 📅 Attendance System
- OTP-based attendance marking
- Admin-view of attendees (live using Socket.IO)
- Secure and tamper-proof tracking

### 🎯 Mission Management
- Admin can create missions with difficulty, location, assigned Avengers, and rewards
- Users can view and complete assigned missions

### 📝 Post Creation
- Users can create and share posts (e.g., updates, progress, etc.)
- Admin can view all posts

### ✉️ Mailing System
- Automatic mailing when certain events occur (e.g., mission assigned, red-alert triggers)
- Configurable email templates

### 🎁 Rewards System
- Admin can assign and manage rewards
- Users can track their earned rewards

### 💬 Real-Time Chat
- Group chat per mission
- 1-1 chat support
- Socket.IO powered, room-based structure

---

## 🛠️ Setup Instructions

### 📁 Clone the Repository

```bash
git clone https://github.com/yourusername/AvengersNexus.git
cd AvengersNexus
