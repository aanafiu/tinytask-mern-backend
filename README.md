# 🧠 TinyTask Backend

A powerful backend for the **TinyTask** MERN app — supporting user roles (Player/Seller), question management, coin-based task solving, and seller package purchases using SSLCommerz payment integration.

> 🔗 **Live API Base URL:** `https://tinytask-backend.vercel.app/`

---

## 📚 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Reference](#-api-reference)
  - [Admin APIs](#admin-apis)
  - [Seller APIs](#seller-apis)
  - [Player APIs](#player-apis)
  - [Current User Hook](#current-user-hook-api)
  - [Payment APIs](#payment-apis)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

- Express.js RESTful API
- MongoDB with flexible schema and multiple collections
- Role-based routes and logic for `Player`, `Seller`, and `Admin`
- Coin transaction tracking and task submission system
- Role toggling with built-in seller onboarding
- Integrated SSLCommerz for secure payments

---

## 🛠️ Installation

```bash
git clone https://github.com/your-repo/tinytask-backend.git
cd tinytask-backend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and include the following:

```env
PORT=5000
MONGO_USER=your_mongo_username
MONGO_PASSWORD=your_mongo_password
SSL_STORE_ID=your_sslcommerz_store_id
SSL_STORE_PASSWORD=your_sslcommerz_store_password
```

---

## 📦 Usage

```bash
node index.js
# or
npx nodemon index.js
```

Backend runs at `http://localhost:5000` or the specified port.

---

## 📡 API Reference

---

### ✅ Admin APIs

| Purpose | Method | Endpoint |
|--------|--------|----------|
| 🔒 Admin Access Control | `GET` | [`/admin`](https://tinytask-backend.vercel.app/admin) |
| 🎯 Admin Data (Full Object) | `GET` | [`/admin?object=admin_data`](https://tinytask-backend.vercel.app/admin?object=admin_data) |
| 📧 Admin by Email | `GET` | [`/admin?object=admin_data&email=admin`](https://tinytask-backend.vercel.app/admin?object=admin_data&email=admin) |
| 📦 Get All Packages | `GET` | [`/admin?object=packages`](https://tinytask-backend.vercel.app/admin?object=packages) |
| ✅ Update Question Status | `PATCH` | `/update-question-status/:id` |

---

### 💼 Seller APIs

| Purpose | Method | Endpoint |
|--------|--------|----------|
| ➕ Request Question | `POST` | `/request-question` |
| 📊 Get Seller Questions (with status) | `GET` | `/seller-questions?email=[email]` |
| 🔁 Toggle Role (Player ↔ Seller) | `PATCH` | `/toggle-role?email=[email]` |
| 💳 Submit Purchase Request | `POST` | `/seller/dashboard-request` |
| 📋 Get Purchase Requests | `GET` | `/seller/dashboard-request?email=[email]` |

---

### 🎮 Player APIs

| Purpose | Method | Endpoint |
|--------|--------|----------|
| 🧍 Register New User | `POST` | `/register` |
| 🔄 Get User Info | `GET` | [`/currentUser?email=aa@bb.com`](https://tinytask-backend.vercel.app/currentUser?email=aa@bb.com) |
| ✅ Submit Completed Task | `POST` | `/completed-task` |
| 📄 Get Completed Tasks | `GET` | [`/completed-task?email=aa@bb.com`](https://tinytask-backend.vercel.app/completed-task?email=aa@bb.com) |
| ❓ Submit Question | `POST` | `/post-questions` |
| 📚 All Questions | `GET` | [`/all-questions`](https://tinytask-backend.vercel.app/all-questions) |
| 📂 Category-Wise Questions | `GET` | [`/all-questions?category=programming`](https://tinytask-backend.vercel.app/all-questions?category=programming) |
| 💰 Coin History Entry | `POST` | `/coin-history` |
| ➕ Update User Coin Balance | `PATCH` | `/update-coin` |

---

### 🔎 Current User Hook API

| Purpose | Method | Endpoint |
|--------|--------|----------|
| 📥 Fetch Current User by Email | `GET` | [`/currentUser?email=user_email`](https://tinytask-backend.vercel.app/currentUser?email=user_email) |
| 📦 Demo | - | [`/currentUser?email=c@v.com`](https://tinytask-backend.vercel.app/currentUser?email=c@v.com) |

---

### 💳 Payment APIs

| Purpose | Method | Endpoint |
|--------|--------|----------|
| 🏁 Initialize Payment | `POST` | `/payment-initialization` |
| ✅ Success Callback | `POST` | `/success-payment` |
| ❌ Fail Callback | `POST` | `/fail` |
| 🔄 Cancel Callback | `POST` | `/cancel` |

---

## 🧪 Examples

### Register a User

```json
POST /register
{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "Player",
  "coin": 5
}
```

### Submit a Completed Task

```json
POST /completed-task
{
  "emailID": "alice@example.com",
  "questionsID": "q123",
  "questionsSolution": "My answer",
  "questionsCategory": "math"
}
```

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.