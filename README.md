# Node.js + MongoDB + Vue 3 — Full-Stack Starter

A minimal full-stack template with a **Node.js + Express + MongoDB** backend and a **Vue 3 (Vite)** frontend.

---

## ✨ Features

- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend: Vue 3 with Vite
- Dev experience: hot reload (nodemon + Vite)
- One-command dev runner from the project root
- Simple, predictable project structure

---

## 🧰 Prerequisites

- **Node.js** (LTS recommended)
- **npm** (bundled with Node)

---

## 📦 Installation

```bash
# 1) Clone
git clone <your-repo-url>
cd <your-project>

# 2) Install deps
npm install          # backend deps at root
cd ui && npm install # frontend deps
```

---

## 🚀 Development

Run backend and frontend **independently** in two terminals:

**Terminal A — Backend**
```bash
npm run dev
# → http://localhost:4000
```

**Terminal B — Frontend**
```bash
cd ui
npm run dev
# → http://localhost:5000
```

---

## 🧪 Testing / One-Command Dev Run

From the **project root** only:

```bash
npm run dev
```

Then open **http://localhost:5000** for the UI.

> This assumes your root `package.json` starts both the backend and the UI concurrently. See the example scripts below.

---

## 🗂️ Suggested Project Structure

```
.
├─ server/
│  ├─ app.js              # Express app entry (connects to MongoDB)
│  ├─ router/               # API routes (e.g., /api/items)
│  ├─ models/               # Mongoose models
|  ├─ data 
|  └─ db
├─ ui/
│  ├─ index.html
│  └─ src/
│     ├─ main.js
│     ├─ App.vue
│     ├─ api/               # small API client using VITE_API_BASE
│     └─ components/
├─ .env                     # backend env
├─ package.json             # root scripts (dev runner)
└─ README.md
```

## 📦 Building & Preview (Optional)

```bash
# Frontend production build
cd ui
npm run build
npm run preview # serves built UI (default on 5000)
```

For backend, use `npm start` (ensure any production server setup is complete).

---
