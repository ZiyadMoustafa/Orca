# 🏢 Orca - Real Estate Management System  

## 📌 Overview  
**Orca** is a real estate management system built for a real estate office.  
The system provides three user roles (Admin, Editor, and Client), secure authentication & authorization, admin approval workflows, property management, and an admin dashboard to monitor all users and properties.  

---

## 🎯 Introduction  
Managing properties and user access in real estate offices can be challenging without a structured system.  
**Orca** solves this problem by offering a reliable platform that enables:  
- Secure and role-based access for different types of users.  
- Smooth workflows for **admin account approval** and property management. 
- An admin dashboard to oversee the entire system.  

This project was developed as a real-world solution for a real estate office.  

---

## 🚀 Features  

- **User Roles**  
  - **Admin**: Full access to manage users, approve new accounts, and monitor properties.  
  - **Editor**: Can add properties.  
  - **Client**: Can browse properties.  

- **Authentication & Authorization**  
  - JWT-based authentication for secure access.  
  - Role-based authorization to protect resources.  

- **Admin Approval Workflows**  
  - Admin approves new accounts before granting full access. 

- **Property Management (CRUD)**  
  - Create, Read, Update, Delete properties.  
  - Secure image upload using Cloudinary.  
  - Auto-generated **property counter**: each property gets a unique sequential number upon creation.  
  - **Advanced Filtering & Search**:  
    - Global search bar to find properties by keyword.  
    - Category filter (e.g., apartment, villa, land, etc.).  
    - City-based filter for location-specific results.
      
- **Favorites System**  
  - Users can add properties to their favorites list for quick access later.

- **Admin Dashboard**  
  - Monitor all registered users.  
  - View and manage all properties.  
  - Platform statistics and insights.  

---

## 🧰 Tech Stack  

| Tool / Technology | Purpose |
|-------------------|---------|
| **Node.js** | Backend runtime environment |
| **Express.js** | framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication |
| **Cloudinary** | Image storage |
| **Multer** | File uploads |
| **Bcrypt** | Password hashing |
| **Vercel** | Hosting |

---

## 📂 Folder Structure  

```bash
backend/
├── controllers/     # Business logic
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Helper functions
├── app.js           # App configuration
├── server.js        # Main server entry point
├── package.json     # Dependencies
└── config.env       # Environment variables
```

## 🔒 Security Measures

- Passwords hashed with bcrypt.
- JWT tokens for authentication with expiration.
- Role-based authorization.
- Input validation before database operations.
- Secure image uploads with Cloudinary.

## 📬 Contact  

For any inquiries or collaboration opportunities, feel free to reach out:  

- **👤 Name:** Ziyad Moustafa Ahmed Ali  
- **📧 Email:** ziyadmoustafa77@gmail.com
