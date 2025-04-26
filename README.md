# ⚖️ Lawya – Online Judicial Services App

Lawya is a full-stack mobile and web platform designed to connect clients in Sri Lanka with verified lawyers for secure and accessible legal consultations.

It features a **React Native mobile app**, a **React-based admin panel**, and a **Django backend with SQL Server**.

---

## Project Structure

```
LawyaApp/
├── client-app/         #Mobile app (React Native + Expo)
├── admin-panel/        #Admin web panel (React + Vite)
├── backend/            #Django API backend (SQL Server)
└── README.md
```

---

## Purpose

Lawya aims to solve accessibility issues in Sri Lanka’s legal system by offering:

- Remote consultations between lawyers and clients
- Verified lawyer registrations with admin approval
- Secure chatroom and document sharing
- Lawyer search and filtering based on expertise
- Booking system with Consultation Points (CP)
- Notifications and appointment reminders

The system streamlines legal help for users in underserved areas and modernizes client-lawyer interaction.

---

## Tech Stack

| Layer        | Stack                                           |
|--------------|-------------------------------------------------|
| Mobile App   | React Native, Expo, Expo Router                 |
| Web Panel    | React + TypeScript, Vite                        |
| Backend API  | Django REST Framework, mssql-django             |
| Database     | Microsoft SQL Server                            |
| Auth         | Token-based (DRF)                               |
| File Uploads | Django Media Storage (qualifications, images)   |

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv-lawya
venv-lawya\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2. Mobile App (client-app)

```bash
cd client-app
npm install
npx expo start
```

Open with **Expo Go**, emulator, or dev build.

### 3. Admin Panel (admin-panel)

```bash
cd admin-panel
npm install
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## Roles and Features

| Role     | Features                                                                 |
|----------|--------------------------------------------------------------------------|
| Client   | Register, search lawyers, book consultations, chat, notifications, profile |
| Lawyer   | Register (with approval), manage consultations, chat, profile             |
| Admin    | Approve/reject lawyers, view documents via admin panel                    |

---

## Docs for Each Module

- [`client-app/README.md`](./client-app/README.md) – React Native app
- [`admin-panel/README.md`](./admin-panel/README.md) – Admin panel
- [`backend/README.md`](./backend/README.md) – Django API

---

##  Project Info

- **Module**: PUSL2021 – Computing Group Project  
- **Group**: Group 82
- **Year**: 2024/25

---

## Future Enhancements

- Push notifications (FCM)
- Live consultation scheduling with calendar view
- CP purchase integration with real payment gateway
- Sinhala/Tamil language support