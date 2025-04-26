# 📱 Lawya Client App (Frontend)

This folder contains the **frontend mobile application** for **Lawya**
The app is built using **React Native** and **Expo Router**, and it serves as the main user-facing frontend for the project.

---

## Purpose

The Lawya mobile app enables clients to:

- Register and log in securely using NIC-based identity
- Discover lawyers based on expertise and location
- Book consultations using Consultation Points (CP)
- Communicate via secure chatrooms with file sharing
- View and edit profile information
- Get notifications about consultation status and updates

Lawyers can also log in to manage incoming consultation requests and chat with clients.

This mobile app was developed as part of our university coursework for **PUSL2021 – Computing Group Project**.

---

## Tech Stack

- **Frontend Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: Built using React Native primitives and custom components in `components/ui`
- **Authentication**: Token-based login via Django REST Framework
- **Backend API**: Hosted at [`http://192.168.1.3:8000/api/`](http://192.168.1.3:8000/api/)