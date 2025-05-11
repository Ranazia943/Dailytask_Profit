# Daily Task Profit - MERN Platform

**Daily Task Profit** is a full-stack **MERN** (MongoDB, Express, React, Node.js) platform that allows users to earn by completing daily tasks. It includes an affiliate program, purchasable plans for enhanced earnings, and an admin panel to manage users, tasks, and earnings.

## 🚀 Features

### For Users:
- **Task Completion:** Users can complete daily tasks to earn money.
- **Earnings Overview:** View current earnings, completed tasks, and pending tasks.
- **Affiliate Program:** Invite others to join the platform using referral links and earn a commission on their earnings.
- **Purchasable Plans:** Upgrade your account with premium plans to unlock higher earnings and more tasks.
- **Email Notifications:** Receive alerts for task status, earnings updates, and withdrawals.

### For Admins:
- **Admin Panel:** Manage all users, track earnings, approve or reject tasks, and handle plan upgrades.
- **User Management:** View, activate, deactivate, and update user accounts.
- **Task Management:** Add, update, or remove tasks available for users to complete.
- **Earnings Tracking:** View daily earnings reports for users and manage withdrawal requests.
- **Affiliate Earnings:** Track and manage commissions earned by referrers.

## 🛠️ Technologies Used

- **Frontend:**
  - React.js
  - CSS / Bootstrap
  
- **Backend:**
  - Node.js with Express
  - MongoDB for data storage
  
- **Email System:**
  - Nodemailer for sending email notifications

## 📁 Project Structure

- `/client` – Frontend React application
- `/server` – Backend Node.js API
  - `/models` – Mongoose models for database interaction
  - `/routes` – API routes for task management, user authentication, earnings, etc.
  - `/controllers` – Business logic for task completion, user registration, affiliate system
  - `/utils` – Helper utilities, including email sending and referral management
