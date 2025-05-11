# Gold Mine Investment App

A fully-featured **MERN** (MongoDB, Express, React, Node.js) based investment application that allows users to invest, track daily earnings, and participate in an affiliate system. This app includes both **User** and **Admin Panels**, automatic earnings calculation, plan requests, and weekly withdrawal requests. It also supports an **affiliate system** where users can refer others to earn commissions.

## 🚀 Features

### For Users:
- **User Dashboard:** View daily earnings, investment plans, and referral status.
- **Investment Plans:** Users can choose and request different investment plans with various return rates.
- **Automatic Daily Earnings:** Users' accounts are updated daily with their earnings based on the investment plan.
- **Withdrawal Requests:** Users can request a withdrawal once per week.
- **Referral System:** If **User 1** refers **User 2**, **User 1** earns a **5% one-time commission** from **User 2's plan** purchase.
- **Email Notifications:** Get updates on plan status, earnings, and withdrawals via email.

### For Admins:
- **Admin Dashboard:** Manage user accounts, approve or reject plan requests, and view earnings across all users.
- **Approve/Reject Investment Plans:** Admin can approve or reject a user’s investment plan request.
- **Track User Earnings:** Admin can view all daily earnings and track weekly withdrawals.
- **Manage Affiliate Earnings:** Admin can see and manage affiliate commissions earned by referrers.

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
  - `/routes` – API routes for user management, investments, and withdrawals
  - `/controllers` – Functions for handling business logic
  - `/utils` – Helper utilities, including email sending

