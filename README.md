# 🛡️ AvengersNexus

AvengersNexus is a full-featured full-stack web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It is a mission and communication management platform featuring role-based dashboards (Admin/Client), attendance tracking, mission assignment, mailing system, post creation, rewards, and real-time chat — all built to manage and engage a distributed superhero workforce.

---

## 🚀 Tech Stack

- **Frontend**: React.js, Redux, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, OTP (via Email)
- **Real-time**: Socket.IO
- **Mailing**: Nodemailer
- **Storage**: Multer (image uploads)
- **Session**: Redis

---

## 📌 Key Features

### 🔐 Authentication & Authorization
- Secure JWT-based login system
- Role-based access control (Admin / Client)
- OTP verification during signup
- College-restricted domain registration (e.g. `.ahduni.edu.in`)

### 🧑‍💼 Admin Dashboard
- Create and assign missions to users
- Manage user attendance and rewards
- View user profiles and statistics
- Create posts (with option to mark as **important** and send via **email**)
- View client-submitted posts
- Real-time feedback and dashboard overview

### 👨‍🎓 Client Dashboard
- View assigned missions and progress
- Mark attendance using secure OTP system
- Submit posts and feedback
- Track earned rewards
- Real-time chat with admin/team

### 📅 Attendance System
- OTP-based attendance marking
- Real-time attendance updates (via WebSocket)
- Admin view of live participants
- Anti-spoofing measures and validations

### 🎯 Mission Management
- Admin can create detailed missions with:
  - Title, Description, Difficulty, Location
  - Assigned Avengers
  - Rewards (Points/Credits)
- Auto-creation of chat rooms upon mission assignment
- Clients view assigned missions and status

### 📝 Post Creation (Admin + Client)
- Clients can create posts (e.g., updates, mission reports)
- Admin can:
  - Create public announcements or mission updates
  - Mark a post as **Important**
  - Automatically trigger **email notifications** to all users if post is important

### ✉️ Mailing System
- Email OTPs for verification and attendance
- Post-related emails if flagged as important
- Admin-to-user announcements and alerts

### 💬 Real-Time Chat
- Room-based chats (one per mission)
- 1-on-1 or group communication
- Powered by Socket.IO
- Typing indicators, real-time delivery

### 🎁 Reward System
- Admin can assign rewards to users based on performance
- Clients can view accumulated rewards in their dashboard

---

## 🛠️ Getting Started

### 📁 Clone the Repository

```bash
git clone https://github.com/avadhpatel1508/AvengersNexus.git
cd AvengersNexus
