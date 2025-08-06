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
- **Session**: Redis
---
## 📌 Key Features

### 🔐 Authentication & Authorization
- Secure JWT-based login system
- Role-based access control (Admin / Client)
- OTP verification during signup

### 🧑‍💼 Admin Dashboard
- Create and assign missions to users
- Manage user attendance and rewards
- View user profiles and statistics
- Create posts (with option to mark as **important** and send via **email**)
- Feedback 

### 👨‍🎓 Client Dashboard
- View assigned missions and progress
- Mark attendance using secure OTP system
- Submit feedback
- Track earned rewards
- Real-time chat with admin/team

### 📅 Attendance System
- OTP-based attendance marking
- Real-time attendance updates (via WebSocket)
- Anti-spoofing measures and validations

### 🎯 Mission Management
- Admin can create detailed missions with:
  - Title, Description, Difficulty, Location
  - Assigned Avengers
  - Rewards (Points/Credits)
- Auto-creation of chat rooms upon mission assignment
- Clients view assigned missions and status

### 📝 Post Creation (Admin)
- Admin can create posts (e.g., updates, mission reports)
- Admin can:
  - Create public announcements or mission updates
  - Mark a post as **Important**
  - Automatically trigger **email notifications** to all users if the post is important

### ✉️ Mailing System
- Email OTPs for verification and attendance
- Post-related emails if flagged as important
- Admin-to-user announcements and alerts

### 💬 Real-Time Chat
- Room-based chats (one per mission)
- Group communication
- Powered by Socket.IO
- Real-time delivery

### 🎁 Reward System
- Admin can assign rewards to users
- Clients can view accumulated rewards in their dashboard

---

## 🛠️ Getting Started

### 📁 Clone the Repository

```bash
git clone https://github.com/avadhpatel1508/AvengersNexus.git
cd AvengersNexus


# Backend Setup
cd backend
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev


# Frontend Setup
cd frontend
npm install
npm run dev


PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/avengersDB
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173


AvengersNexus/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── assets/
│   └── App.jsx
│
└── README.md
