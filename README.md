# 🍔 FoodReels

An Instagram Reels-style food discovery platform where restaurants upload short food videos and users browse, like, save and share them — now with **AI-powered food description generation** using Google Gemini.

![Stack](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-green)

> Built for the **Razorpay AI Builder Internship 2026**

---

## ✨ AI Feature — Food Description Generator

When a food partner creates a new reel, they can enter the food name and click **✨ Generate with AI**. Google Gemini instantly generates an attractive, social-media-ready food description that auto-fills the textarea — fully editable before submitting.

**How it works (secure architecture):**
```
React CreateFood (frontend)
        ↓  POST /api/food/generate-description
Express Backend (authFoodPartnerMiddleware)
        ↓
ai.service.js
        ↓
Google Gemini API
        ↓
Generated description text
        ↓
React textarea (editable by user)
```

- The **Gemini API key never reaches the frontend**
- Stored only in `backend/.env` — never committed to GitHub
- Route is protected — only authenticated food partners can call it

---

## 📱 Features

### For Users
- Vertical snap-scroll reels feed (Instagram Reels style)
- Auto-play on scroll, tap to pause, double-tap to like ❤️
- Like, save and share food reels
- Search by food name, description or restaurant
- Saved reels collection
- User profile with saved reels grid and logout

### For Food Partners (Restaurants)
- Register and login as a restaurant
- **✨ AI-generated food descriptions** (Google Gemini)
- Upload food videos with name and description
- Public restaurant profile with hero banner, stats, video grid
- Click-to-play video lightbox on profile

### General
- Infinite looping feed — never ends
- Share sheet — WhatsApp, Twitter/X, Telegram, copy link
- Desktop: left info panel | centered video | right actions
- Mobile: full-screen overlay layout
- Light & dark theme (system preference)
- Fully responsive

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Axios, Vite 8 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) + bcryptjs |
| File Storage | ImageKit |
| AI | Google Gemini (`gemini-3.6-flash`) |
| Styling | Pure CSS with CSS variables |

---

## 📁 Project Structure

```
FoodReels/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── food.controllers.js      ← generateDescription added here
│   │   │   └── food-partner.controller.js
│   │   ├── models/            # user, foodpartner, food, like, save
│   │   ├── routes/
│   │   │   └── food.routes.js           ← /generate-description route added
│   │   ├── middlewares/       # JWT auth middleware
│   │   ├── services/
│   │   │   ├── storage.service.js       # ImageKit
│   │   │   └── ai.service.js            ← NEW — Gemini AI service
│   │   └── db/
│   ├── server.js
│   ├── .env                   # NOT committed (see .env.example)
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/        # ReelFeed, BottomNav, Toast, ShareSheet, etc.
    │   ├── pages/
    │   │   ├── auth/          # Login & Register pages
    │   │   ├── food-partner/
    │   │   │   └── CreateFood.jsx       ← ✨ Generate with AI button added
    │   │   └── general/       # Home, Search, Saved, UserProfile, VideoPlayer
    │   ├── routes/
    │   └── styles/
    └── index.html
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)
- [ImageKit](https://imagekit.io) account (free tier)
- [Google Gemini API key](https://aistudio.google.com/app/apikey) (free)

---

### 1. Clone the repo

```bash
git clone https://github.com/muskan-773/FoodReels.git
cd FoodReels
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (use `.env.example` as reference):

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
GEMINI_API_KEY=your_gemini_api_key
```

Get your free Gemini API key at → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

Start the backend:

```bash
node server.js
```

You should see:
```
Server is running on port 3001
MongoDB connected
```

---

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🚀 How to Use

### As a Food Partner (Restaurant)
1. Go to `/food-partner/register` → create a restaurant account
2. Go to `/create-food`
3. Enter a food name e.g. `Paneer Tikka`
4. Click **✨ Generate with AI** → description auto-fills
5. Edit if needed → upload a video → click **Save Food**
6. Your reel appears in the home feed

### As a User
1. Go to `/user/register` → create an account
2. Browse the home feed at `/`
3. Like ❤️, save 🔖, and share reels
4. Search food at `/search`
5. View saved videos at `/saved`
6. View your profile at `/profile`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/user/register` | Register user |
| POST | `/api/auth/user/login` | Login user |
| GET | `/api/auth/user/logout` | Logout user |
| GET | `/api/auth/user/me` | Get logged-in user |
| POST | `/api/auth/food-partner/register` | Register food partner |
| POST | `/api/auth/food-partner/login` | Login food partner |
| GET | `/api/auth/food-partner/logout` | Logout food partner |
| GET | `/api/auth/food-partner/me` | Get logged-in partner |

### Food
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/food` | Get all food reels (public) |
| GET | `/api/food/:id` | Get single food reel (public) |
| POST | `/api/food` | Upload food reel (partner only) |
| POST | `/api/food/generate-description` | **AI description generator** (partner only) |
| POST | `/api/food/like` | Like / unlike (user only) |
| POST | `/api/food/save` | Save / unsave (user only) |
| GET | `/api/food/save` | Get saved foods (user only) |

### Food Partner
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/food-partner/:id` | Get partner profile (public) |
| PUT | `/api/food-partner/profile` | Update own profile (partner only) |

---

## 🌍 Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public API key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private API key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `GEMINI_API_KEY` | Google Gemini API key for AI descriptions |

---

## 🔒 Security

- Gemini API key is stored only in `backend/.env`
- `.env` is in `.gitignore` — never committed to GitHub
- AI endpoint protected by `authFoodPartnerMiddleware`
- JWT tokens stored in httpOnly cookies — not localStorage
- No secrets exposed in frontend code or error messages

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT © [muskan-773](https://github.com/muskan-773)
