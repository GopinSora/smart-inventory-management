# Smart Inventory Management System

A production-grade web application for tracking computer hardware (keyboards, mice, monitors, CPUs) across labs and rooms — with secure authentication, real-time cloud sync, room-based organization, and a built-in conversational assistant.

Built by **Gopin Sora** · MCA AI & Deep Learning · Assam Down Town University.

---

## ✨ Features

- **🔐 Authentication** — Email/password and Google sign-in via Firebase Auth, with password reset and protected routes.
- **📦 Full CRUD** — Create, read, update, and delete hardware items across four mandatory categories: Keyboard, Mouse, Monitor, CPU.
- **📊 Dashboard** — Live stats: total inventory, per-category breakdown, condition distribution, recent additions.
- **🏢 Rooms** — Optional location feature: create rooms, assign items, drill down to view inventory room-wise.
- **🤖 AI Assistant** — A floating chatbot that answers natural-language questions about your live inventory ("how many monitors", "what's in Lab A-201", "show faulty items").
- **🌅 Cream light theme** — Calm, warm, editorial aesthetic with custom typography (Fraunces + Manrope + JetBrains Mono).
- **☁️ Real-time sync** — Firestore subscriptions; data updates instantly across tabs and devices.
- **🔒 Secure by design** — Per-user data isolation enforced by Firestore security rules.
- **📱 Responsive** — Works beautifully on mobile, tablet, and desktop.

---

## 🛠 Tech Stack

- **Vite + React 18** — fast dev experience, modern React patterns.
- **React Router v6** — client-side routing with route guards.
- **Firebase v10** — Auth (email + Google) + Firestore (real-time NoSQL DB).
- **Tailwind CSS** — utility-first styling with a custom cream theme.
- **lucide-react** — icon system.
- **react-hot-toast** — toast notifications.
- **Vercel** — zero-config deployment.

---

## 📁 Project structure

```
smart-inventory/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                       # Router + providers
│   ├── main.jsx                      # Entry
│   ├── index.css                     # Global styles + cream theme
│   ├── config/
│   │   ├── firebase.js               # Firebase init (auth, db, analytics)
│   │   └── constants.js              # Categories, conditions
│   ├── context/
│   │   ├── AuthContext.jsx           # Auth state + methods
│   │   └── InventoryContext.jsx      # Live inventory subscription
│   ├── lib/
│   │   ├── helpers.js                # cn(), fmtDate(), errors, etc.
│   │   └── inventoryService.js       # Firestore CRUD operations
│   ├── components/ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx                 # Input, Textarea, Select
│   │   ├── Modal.jsx
│   │   ├── Primitives.jsx            # Field, Label, Pill, Card, EmptyState
│   │   ├── ConditionBadge.jsx
│   │   ├── LoadingScreen.jsx
│   │   └── UserMenu.jsx
│   ├── layouts/
│   │   └── AppShell.jsx              # Header + nav + footer
│   ├── features/
│   │   ├── auth/
│   │   │   ├── AuthLayout.jsx        # Split-screen brand panel
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── inventory/
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── ItemRow.jsx
│   │   │   ├── ItemFormModal.jsx
│   │   │   └── ConfirmDeleteModal.jsx
│   │   ├── rooms/
│   │   │   ├── RoomsPage.jsx
│   │   │   └── RoomFormModal.jsx
│   │   └── chatbot/
│   │       ├── Chatbot.jsx           # Floating widget UI
│   │       └── chatbotEngine.js      # NLU + query engine
├── firestore.rules                   # Per-user security rules
├── vercel.json                       # Vercel deployment config
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── index.html
├── .env.example
└── package.json
```

---

## 🚀 Getting started locally

### 1. Install dependencies

```bash
npm install
```

### 2. (Optional) Configure environment variables

The Firebase config is already inlined in `src/config/firebase.js` so the app works immediately. To override (recommended for production), copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 🔥 Firebase setup checklist

In the [Firebase Console](https://console.firebase.google.com/) for project `smartinventory-dd77d`:

1. **Authentication → Sign-in method**
   - Enable **Email/Password**.
   - Enable **Google** (and configure your support email).
2. **Firestore Database**
   - Create the database in **production mode**.
   - Open the **Rules** tab and paste the contents of `firestore.rules`, then publish.
3. **Authorized domains** (for Google sign-in)
   - Under **Authentication → Settings → Authorized domains**, add your Vercel domain (e.g. `your-app.vercel.app`) once deployed.

---

## 🚢 Deploying to Vercel

### Option A — Via the Vercel dashboard (recommended)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Vite. Leave defaults — `vercel.json` handles SPA rewrites.
4. (Optional) Add the variables from `.env.example` under **Settings → Environment Variables**.
5. Click **Deploy**.

### Option B — Via the Vercel CLI

```bash
npm i -g vercel
vercel
# follow prompts, then:
vercel --prod
```

### After deploying

Add your live Vercel URL to Firebase **Authorized domains** so Google sign-in works in production.

---

## 🤖 The chatbot

The assistant is a **rule-based NLU engine** that runs entirely in the browser against your live inventory data. It can answer:

| Intent | Examples |
|---|---|
| Counts | "how many keyboards", "total inventory" |
| Conditions | "show faulty items", "what's in repair" |
| Rooms | "what's in Lab A-201", "list rooms" |
| Brands | "do I have any Logitech", "Dell monitors" |
| Search | "find MX Master", "where is the ThinkCentre" |
| Recent | "what was added recently", "latest items" |
| Help | "help", "what can you do" |

It supports filter combinations like `"how many Logitech mice in Lab A-201"`. No API key, no cost, no external dependency — answers come from your live Firestore data.

---

## 🔐 Security model

- Firebase Auth handles sign-in; user UIDs are the source of identity.
- All Firestore data is stored under `users/{uid}/items/*` and `users/{uid}/rooms/*`.
- The bundled `firestore.rules` enforce that **users can only read/write their own data** at the database level — even if someone bypasses the client.
- Firebase API keys in client code are safe by design — they identify the project, not authorize access. Access is enforced by security rules and Auth.

---

## 📜 License

Built for educational use as part of MCA coursework. Free to adapt.
