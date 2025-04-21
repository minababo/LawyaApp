# 🧠 Lawya Backend API (Django + SQL Server)

This folder contains the **backend API** for Lawya

The backend is built using **Django** and the **Django REST Framework**, and is connected to a **Microsoft SQL Server** database. It handles user registration, authentication, lawyer approval, consultations, chat, notifications, and more.

---

## 🔍 Purpose

This backend provides all business logic and data handling for the Lawya platform:

- 🔐 Token-based user authentication
- 🧾 Role-based account creation (client, lawyer, admin)
- 📄 Lawyer registration with document uploads
- ✅ Admin approval system for lawyers
- 🗓️ Consultation request and response flow
- 💬 Encrypted messaging/chatroom per consultation
- 🧠 Profile management for both clients and lawyers
- 🔔 Notification system for status updates and reminders
- 🪙 Consultation Point (CP) balance management

---

## ⚙️ Tech Stack

- **Backend Framework**: Django 4.x
- **API**: Django REST Framework
- **Database**: Microsoft SQL Server
- **Auth**: Token authentication (REST framework's `TokenAuthentication`)
- **Storage**: Local `media/` directory for profile pictures and uploaded documents
- **Hosting**: Localhost for development (`http://192.168.1.3:8000/`)