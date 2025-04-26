# 🛠️ Lawya Admin Panel

This folder contains the **web-based admin interface** for Lawya

The admin panel is built using **React + TypeScript** and provides tools for managing lawyer registrations and overseeing platform operations.

---

## Purpose

The Admin Panel allows system administrators to:

- **Review, approve, or reject lawyer registrations**
- **View uploaded qualification documents (e.g., certifications)**
- **Filter and sort lawyers by approval status, expertise, NIC, and registration date**
- **Securely log in using token-based authentication**
- *(Planned)* Monitor consultation trends, registration growth, and system statistics

This admin interface was developed as part of our university coursework for **PUSL2021 – Computing Group Project**.

---

## Tech Stack

- **Frontend**: React + TypeScript
- **UI Framework**: Custom CSS (styled to match the Lawya mobile app's modern look)
- **Authentication**: Token-based login via Django REST Framework
- **Backend API**: Hosted at [`http://localhost:8000/api/`](http://localhost:8000/api/)
- **Development Server**: [`http://localhost:5173`](http://localhost:5173) (Vite default port)