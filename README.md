# 🍔 FoodReels

A TikTok/Instagram Reels-style food discovery app where restaurants upload short food videos and users can browse, like, save and share them.

![FoodReels](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📱 Features

### For Users
- Vertical snap-scroll reels feed (just like Instagram Reels)
- Auto-play / pause on scroll
- Tap to pause, double-tap to like ❤️
- Like, save and share food reels
- Search food by name, description or restaurant
- Saved reels collection
- User profile page with saved reels grid

### For Food Partners (Restaurants)
- Register as a food partner / restaurant
- Upload food videos with name & description
- Public restaurant profile with stats (reels, likes, saves)
- Video grid with click-to-play lightbox
- Edit profile

### General
- Infinite looping feed
- Share sheet — WhatsApp, Twitter/X, Telegram, copy link
- Desktop layout: left info panel | video | right actions
- Mobile layout: full screen reels with overlay
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
| Styling | Pure CSS with CSS variables |

---

## 📁 Project Structure

```
FoodReels/
├── backend/
│   ├── src/
│   │   ├── controllers/       # auth, food, food-partner
│   │   ├── models/            # user, foodpartner, food, like, save
│   │   ├── routes/            # auth, food, food-partner
│   │   ├── middlewares/       # JWT auth middleware
│   │   ├── services/          # ImageKit upload service
│   │   └── db/                # MongoDB connection
│   ├── server.js
│   └── .env                   # environment variables (not committed)
│
└── frontend/
    ├── src/
    │   ├── components/        # ReelFeed, BottomNav, Toast, ShareSheet, etc.
    │   ├── pages/
    │   │   ├── auth/          # Login & Register pages
    │   │   ├── food-partner/  # CreateFood, Profile
    │   │   └── general/       # Home, Search, Saved, UserProfile, VideoPlayer
    │   ├── routes/            # AppRoutes.jsx
    │   └── styles/            # CSS files per component
    └── index.html
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)
- [ImageKit](https://imagekit.io) account (free tier)

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

Create a `.env` file in the `backend/` folder:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

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

Open a new terminal:

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
2. Upload a food video on `/create-food`
3. Your videos appear in the home feed

### As a User
1. Go to `/user/register` → create an account
2. Browse the home feed at `/`
3. Like ❤️, save 🔖, and share videos
4. View saved videos at `/saved`
5. Search food at `/search`
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

---

## 📸 Screenshots

> Home feed — vertical snap-scroll reels with like, save, share actions  
> Search page — live filter by food name, description or restaurant  
> Restaurant profile — hero banner, stats, video grid with lightbox  
> User profile — avatar, saved reels grid, logout

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT © [muskan-773](https://github.com/muskan-773)
