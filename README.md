# 🍔 FoodReels

> An interactive, Instagram Reels-style food discovery platform where local restaurants showcase their best culinary creations, and foodies discover what to eat using a TikTok-style feed and a **Gemini AI Craving Sommelier**.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React 19](https://img.shields.io/badge/React-19.x-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 💡 Why FoodReels?

Static restaurant menus with plain text descriptions and flat photos don't do justice to sizzling fajitas, molten chocolate lava cakes, or rich ramen broth. Food is inherently sensory and visual. 

**FoodReels** bridges the gap between passionate food creators and hungry foodies:
1. **Restaurants (Food Partners)** can upload short-form reels of their signature dishes, let **Google Gemini** write appetizing captions with one click, and attract local diners directly to their storefront.
2. **Foodies** can scroll through an immersive, auto-playing video feed, double-tap to like, bookmark saved dishes, or describe their exact mood/craving to an **AI Food Sommelier** to get instant recommendations.

---

## ✨ Key Features

### 🎬 For Foodies
- **Vertical Reels Feed**: Smooth snap-scroll video feed (mobile full-screen overlay & 3-column desktop layout).
- **Sound Toggle & Controls**: Interactive audio mute/unmute button with persistent state, plus keyboard shortcuts (`Arrow Up/Down` to navigate reels, `M` to mute, `Space` to pause).
- **Double-Tap Hearts & Likes**: Double-tap on the video triggers a floating heart burst animation; like and bookmark counts persist in the database and across reloads.
- **Save Collection**: Save dishes you want to try later into your personal saved reels vault with instant access.
- **✨ AI Craving Sommelier**: Search by describing what you feel like eating in natural language (e.g. *"something spicy and crispy for a rainy evening under 600 calories"* or *"creamy comfort pasta"*), complete with dietary filter pills (Vegetarian, Vegan, Gluten-Free, High-Protein, Spicy) and AI-generated match explanations.
- **Direct Store Navigation**: One click on any dish links directly to the restaurant's public profile, address, and contact details.

### 🍴 For Restaurant Partners
- **Dedicated Partner Portal**: Separate registration and authentication for business owners.
- **✨ Gemini AI Caption Generator**: Type your dish name and cuisine, click *"✨ Generate with Gemini"*, and the AI creates a mouthwatering, social-media-ready caption that you can edit before publishing.
- **Rich Dish Metadata**: Set cuisine tags (Italian, Indian, Japanese, Mexican, etc.), dietary badges, and price.
- **Video Upload Pipeline**: Video uploads handled via Multer and stored securely on ImageKit CDN (with graceful local fallback in dev mode).
- **Public Restaurant Storefront**: Showcase all your uploaded reels, total likes received, address, phone number, and owner contact details.

---

## 🧠 AI Recommendation Architecture

The recommendation engine in `backend/src/services/ai.service.js` is designed to be **grounded in real database data** with **zero hallucination** and a **reliable offline fallback**:

```
User Craving Prompt ("Spicy cheesy pasta for dinner")
                     │
                     ▼
          Express POST /api/food/recommend
                     │
                     ▼
  Fetch real dishes from MongoDB (populated with cuisine & tags)
                     │
          ┌──────────┴──────────┐
          │                     │
[GEMINI_API_KEY Available]  [Offline / No API Key / Rate Limit]
          │                     │
          ▼                     ▼
Gemini Model Evaluates     Heuristic Scoring Engine:
Real Database Catalog:      - Keyword & craving matching
- Evaluates flavor notes    - Dietary filter validation
- Calculates % match score  - Community popularity boost
- Writes custom pairing     - Generates structured reason
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
  In-Memory 5-Min Cache (reduces API token consumption)
                     │
                     ▼
  Enriched JSON Response to Frontend
  (Match score %, personalized reason, suggested beverage pairing)
```

### Fallback Guarantee
If `GEMINI_API_KEY` is not provided or Gemini returns a rate-limit error, the engine seamlessly switches to its built-in heuristic TF-IDF matcher. **The app never crashes or returns an empty error screen.**

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 + Vite 8 | Ultra-fast client-side SPA with lightning HMR |
| **Routing** | React Router v7 | Nested routes, search query parameters (`?highlight=id`) |
| **HTTP Client** | Axios | Custom interceptor attaching Authorization Bearer tokens |
| **Backend Runtime** | Node.js (v18+) + Express 5 | High-performance RESTful API with cookie and bearer auth |
| **Database** | MongoDB + Mongoose 9 | Schemas for Users, Food Partners, Dishes, Likes, and Saves |
| **Authentication** | JWT + bcryptjs | Dual authentication: HTTP-only secure cookies + Bearer headers |
| **AI Integration** | Google Gemini (`@google/generative-ai`) | Content generation & intelligent culinary recommendation |
| **File Storage** | ImageKit Node SDK | Cloud storage and CDN optimization for video reels |
| **Styling & Icons** | Editorial Pure CSS Design System + Lucide React | Playfair Display serif, Plus Jakarta Sans, dark caviar palette, zero bloated UI libraries |

---

## 📁 Project Structure

```
FoodReels/
├── backend/
│   ├── server.js                      # Server entry point with dynamic PORT & graceful shutdown
│   ├── package.json                   # Dependencies, start, seed, and test scripts
│   ├── .env.example                   # Environment variable documentation & placeholders
│   ├── render.yaml                    # 1-Click Render deployment blueprint
│   ├── tests/
│   │   └── api.test.js                # Automated backend verification test suite
│   └── src/
│       ├── app.js                     # Express app, dynamic CORS, /api/health, error handling
│       ├── controllers/
│       │   ├── auth.controller.js     # User & Partner registration, login, logout, me
│       │   ├── food.controllers.js    # Reels feed, like/save toggling, AI recommendations
│       │   └── food-partner.controller.js # Public partner profile & updates
│       ├── db/
│       │   ├── db.js                  # MongoDB connection with retry & logging
│       │   └── seed.js                # Database seeder with realistic demo reels & partners
│       ├── middlewares/
│       │   └── auth.middleware.js     # JWT validation (cookie & Bearer header) + optional auth
│       ├── models/
│       │   ├── user.model.js          # Foodie user schema
│       │   ├── foodpartner.model.js   # Restaurant business schema
│       │   ├── food.model.js          # Dish reel schema (video URL, cuisine, dietaryTags, price)
│       │   ├── likes.model.js         # Unique user-to-food like relationships
│       │   └── save.model.js          # Unique user-to-food bookmark relationships
│       ├── routes/
│       │   ├── auth.routes.js         # Auth endpoints
│       │   ├── food.routes.js         # Reels & AI recommendation routes
│       │   └── food-partner.routes.js # Partner storefront routes
│       └── services/
│           ├── ai.service.js          # Gemini model client, caption generator & recommendation engine
│           └── storage.service.js     # ImageKit video upload handler with dev fallback
│
├── frontend/
│   ├── index.html                     # HTML5 entry with viewport tags
│   ├── vite.config.js                 # Vite bundler configuration
│   ├── package.json                   # React 19 dependencies & build scripts
│   ├── vercel.json                    # Single Page Application rewrites for Vercel
│   ├── .env.example                   # VITE_API_URL documentation
│   └── src/
│       ├── main.jsx                   # React root mount
│       ├── App.jsx                    # Root app wrapper with AuthProvider
│       ├── context/
│       │   └── AuthContext.jsx        # Global authentication state, login, logout, role check
│       ├── services/
│       │   └── api.js                 # Central Axios instance with Bearer token interceptor
│       ├── components/
│       │   ├── TopNav.jsx             # Desktop & mobile navigation bar with brand badge
│       │   ├── BottomNav.jsx          # Mobile bottom navigation bar with role-aware routes
│       │   ├── ReelFeed.jsx           # Vertical snap-scroll feed with mute toggle & keyboard nav
│       │   ├── VideoCard.jsx          # Compact video thumbnail card with hover preview
│       │   ├── SearchBar.jsx          # Search input component
│       │   ├── ShareSheet.jsx         # Social sharing modal (WhatsApp, Twitter, copy link)
│       │   ├── Skeleton.jsx           # Shimmer loading skeleton
│       │   ├── EmptyState.jsx         # Clean empty state with icon and call-to-action
│       │   └── Toast.jsx              # Lightweight notification toasts
│       ├── pages/
│       │   ├── general/
│       │   │   ├── Home.jsx           # Primary food reel discovery feed
│       │   │   ├── Search.jsx         # AI Craving Sommelier + Catalog search
│       │   │   ├── Saved.jsx          # User's bookmarked reels
│       │   │   ├── VideoPlayer.jsx    # Standalone video view
│       │   │   └── UserProfile.jsx    # User & Partner account dashboard
│       │   ├── auth/
│       │   │   ├── ChooseRegister.jsx # Landing to choose Foodie vs Restaurant role
│       │   │   ├── UserLogin.jsx      # Foodie login form
│       │   │   ├── UserRegister.jsx   # Foodie registration form
│       │   │   ├── FoodPartnerLogin.jsx    # Partner login form
│       │   │   └── FoodPartnerRegister.jsx # Partner registration form
│       │   └── food-partner/
│       │       ├── CreateFood.jsx     # Reel upload form with Gemini AI caption generator
│       │       └── Profile.jsx        # Public restaurant storefront & video grid
│       └── styles/
│           ├── theme.css              # Design system tokens, color variables & resets
│           ├── top-nav.css            # Header styling
│           ├── bottom-nav.css         # Bottom mobile navigation
│           ├── reels.css              # Reel video feed styling & animations
│           ├── search.css             # AI Sommelier & catalog cards
│           └── auth-shared.css        # Authentication form cards
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on v20 and v22)
- **npm** v9+
- **MongoDB** (either a local MongoDB instance running on `localhost:27017` or a free MongoDB Atlas connection string)
- *(Optional)* A free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)
- *(Optional)* A free **ImageKit Account** from [ImageKit.io](https://imagekit.io/) for cloud video uploads

### 2. Clone the Repository
```bash
git clone https://github.com/muskan-773/FoodReels.git
cd FoodReels
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create your `backend/.env` file:
```bash
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_here_change_me
MONGODB_URI=mongodb://localhost:27017/foodreels

# Optional: Add your Google Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Optional: Add ImageKit keys for video uploading (falls back to local in dev)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### 4. Seed Sample Data (Recommended!)
Populate the database with demo restaurants, appetizing food reels, and demo accounts:
```bash
npm run seed
```

This creates:
- **Foodie User**: `foodie@example.com` / `password123`
- **Partner Kitchen**: `marco@bellanapoli.com` / `password123`
- **Partner Kitchen**: `priya@spicesymphony.com` / `password123`
- 6 high-definition, fast-loading food reels with cuisines and dietary tags.

### 5. Start the Backend Server
```bash
npm start
# Server starts at http://localhost:3001
```

### 6. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create your `frontend/.env` file:
```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to your backend:
```env
VITE_API_URL=http://localhost:3001
```

Start the Vite development server:
```bash
npm run dev
# Frontend will be live at http://localhost:5173
```

Open your browser at **http://localhost:5173** and enjoy FoodReels!

---

## 🧪 Automated Testing

The backend includes an automated test suite verifying health endpoints, 404 routing, auth validation, offline AI fallback generation, and the heuristic recommendation matcher:

```bash
cd backend
npm test
```

Expected output:
```
🧪 Starting FoodReels Backend Verification Tests...

  ✅ PASS: GET /api/health returns healthy status
  ✅ PASS: GET / returns API welcome and health link
  ✅ PASS: GET /api/nonexistent returns clean 404 JSON
  ✅ PASS: POST /api/auth/user/register rejects empty fields with 400
  ✅ PASS: POST /api/food rejects unauthenticated food partner with 401
  ✅ PASS: AI Service generates fallback description when offline
  ✅ PASS: AI Recommendation Engine selects matching dishes with scores and reasons

📊 Test Summary: 7 passed, 0 failed
✨ All backend verification checks passed!
```

To test the frontend build:
```bash
cd frontend
npm run build
```

---

## 📡 API Reference

All endpoints return JSON responses. Protected endpoints accept authentication via both HTTP-only cookies and `Authorization: Bearer <token>` headers.

### System & Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Welcome banner and status |
| `GET` | `/api/health` | Public | Health check (MongoDB status, uptime, environment) |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Body Parameters | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/user/register` | Public | `fullName`, `email`, `password` | Register a new user |
| `POST` | `/api/auth/user/login` | Public | `email`, `password` | Login as user (returns token) |
| `GET/POST` | `/api/auth/user/logout` | Public | None | Clear session |
| `GET` | `/api/auth/user/me` | User | None | Fetch current user profile |
| `POST` | `/api/auth/food-partner/register` | Public | `name`, `contactName`, `email`, `phone`, `address`, `password` | Register food partner |
| `POST` | `/api/auth/food-partner/login` | Public | `email`, `password` | Login as food partner |
| `GET/POST`| `/api/auth/food-partner/logout` | Public | None | Clear partner session |
| `GET` | `/api/auth/food-partner/me` | Partner | None | Fetch current partner profile |

### Food Reels & Recommendations (`/api/food`)
| Method | Endpoint | Access | Parameters / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/food` | Public (Optional Auth) | Query: `cuisine`, `search`, `page`, `limit` | Get reels feed with `isLiked` and `isSaved` states |
| `POST` | `/api/food/recommend` | Public (Optional Auth) | `{ query, dietaryPreferences, cuisine }` | Gemini AI food craving recommendations |
| `POST` | `/api/food/like` | User | `{ foodId }` | Toggle like on a reel |
| `POST` | `/api/food/save` | User | `{ foodId }` | Toggle save/bookmark on a reel |
| `GET` | `/api/food/save` | User | None | Get user's saved reels collection |
| `POST` | `/api/food/generate-description`| Partner | `{ foodName, category }` | Generate appetizing caption with Gemini AI |
| `POST` | `/api/food` | Partner | Multipart: `name`, `video`, `cuisine`, `dietaryTags`, `price` | Upload and publish a new reel |
| `GET` | `/api/food/:id` | Public | None | Get single food reel by ID |

### Food Partner Storefront (`/api/food-partner`)
| Method | Endpoint | Access | Body Parameters | Description |
|---|---|---|---|---|
| `GET` | `/api/food-partner/:id` | Public | None | Get restaurant profile and its uploaded reels |
| `PUT` | `/api/food-partner/profile` | Partner | `{ name, contactName, phone, address, currentPassword, newPassword }` | Update restaurant details |

---

## 🌐 Production Deployment Guide

FoodReels is built with a decoupled architecture, ideal for deploying the **frontend to Vercel** and the **backend to Render** with a cloud **MongoDB Atlas** database.

### 1. MongoDB Atlas Setup
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com/).
2. Under **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**, create a database user and password.
4. Click **Connect** → **Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodreels?retryWrites=true&w=majority
   ```

### 2. Backend Deployment on Render
1. Go to [render.com](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = (Generate a 32+ character random string)
   - `MONGODB_URI` = (Your MongoDB Atlas connection URI)
   - `FRONTEND_URL` = `https://your-foodreels-app.vercel.app` (Add after Vercel deployment)
   - `GEMINI_API_KEY` = (Your Google AI Studio Gemini API Key)
   - `GEMINI_MODEL` = `gemini-1.5-flash`
   - `IMAGEKIT_PUBLIC_KEY` = (Your ImageKit public key)
   - `IMAGEKIT_PRIVATE_KEY` = (Your ImageKit private key)
   - `IMAGEKIT_URL_ENDPOINT` = (Your ImageKit URL endpoint)
5. Click **Deploy**. Note your backend URL (e.g., `https://foodreels-api.onrender.com`).
6. *(Optional Seed)* In the Render Shell tab, run `npm run seed` to populate the initial database!

### 3. Frontend Deployment on Vercel
1. Go to [vercel.com](https://vercel.com/) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**:
   - `VITE_API_URL` = `https://foodreels-api.onrender.com` (Your deployed Render backend URL)
5. Click **Deploy**.
6. Once deployed, copy your Vercel live URL and update the `FRONTEND_URL` environment variable on Render so CORS allows the production domain.

---

## 🛠️ Troubleshooting & FAQ

#### Q: The videos don't play audio when scrolling.
> **Answer**: By default, modern browsers (Chrome, Safari, Edge) block unmuted audio auto-play without prior user interaction. Click the 🔇 speaker icon in the top right of any reel to unmute. Once unmuted, subsequent reels will automatically play with sound!

#### Q: How do I test the AI recommendation without a Gemini API key?
> **Answer**: You don't need an API key to test! The service contains an intelligent heuristic matching engine that analyzes keywords, cuisine tags, and popularity scores. If no Gemini API key is configured, it automatically falls back to heuristic matching and generates clear match reasons.

#### Q: I get CORS errors when connecting the deployed frontend and backend.
> **Answer**: 
> 1. Verify that `FRONTEND_URL` in your Render backend matches your exact Vercel URL (e.g. `https://foodreels.vercel.app` without a trailing slash).
> 2. The backend also supports `Authorization: Bearer <token>` in addition to cookies, which bypasses cross-domain third-party cookie restrictions in Safari and Chrome incognito mode.

#### Q: My video upload fails in development.
> **Answer**: If ImageKit credentials are not configured in `backend/.env`, the backend provides a built-in fallback video URL so you can still create and publish dishes while developing locally.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
