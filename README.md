# AuctionHub

Full-stack auction platform with 3D model visualization, real-time bidding, and admin dashboard. Built as an engineering thesis project (projekt inżynierski).

## Tech Stack

**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT authentication
**Frontend:** React 19, Vite 7, Tailwind CSS, React Router
**3D Visualization:** WebGPU with Emscripten (C++ → WebAssembly)
**Testing:** Jest, Supertest, MongoDB Memory Server

## Features

- **Auction Management** — create, edit, and browse auctions across 12 categories
- **Bidding System** — manual bids, auto-bids, and buy-now with race condition protection
- **3D Model Viewer** — interactive WebGPU-based viewer for OBJ/GLTF/GLB/FBX models
- **User Accounts** — registration, login, profiles, ratings, watchlists
- **Admin Dashboard** — user management, auction moderation, system health monitoring, bid oversight
- **Security** — bcrypt password hashing, JWT auth, role-based access control, input validation

## Project Structure

```
├── backend/
│   ├── Controllers/       # Route handlers (User, Auction, Bid, Admin)
│   ├── Models/            # Mongoose schemas (User, Auction, Bid)
│   ├── routes/            # API route definitions
│   ├── middleware/         # JWT auth & role-based access
│   ├── utils/             # Error handling utilities
│   ├── __tests__/         # Unit, implementation & functional tests
│   └── server.js          # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar, Footer, AuctionCard, WebGPU viewer
│   │   ├── pages/         # Main pages & admin panel
│   │   ├── contexts/      # Auth context (global state)
│   │   ├── services/      # API client functions
│   │   └── utils/         # Helpers (API, date formatting)
│   └── public/resources/  # 3D models and textures
└── screens/               # Screenshots
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Browser with WebGPU support (for 3D features)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/auctionhub
JWT_SECRET=your-secret-key-at-least-32-characters
JWT_EXPIRES_IN=7d
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run the server:

```bash
npm run dev       # development (with nodemon)
npm start         # production
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

To build for production:

```bash
npm run build
npm run preview
```

## API Endpoints

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login |
| GET | `/me` | User | Current user profile |
| PATCH | `/me` | User | Update profile |
| PATCH | `/me/password` | User | Change password |
| DELETE | `/me` | User | Delete account |
| GET | `/profile/:id` | — | Public profile |

### Auctions (`/api/auctions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List auctions (paginated) |
| GET | `/search` | — | Search with filters |
| GET | `/featured` | — | Featured auctions |
| GET | `/categories` | — | Available categories |
| GET | `/:id` | — | Auction details |
| POST | `/` | User | Create auction |
| PATCH | `/:id` | User | Update auction |
| DELETE | `/:id` | User | Delete auction |
| POST | `/:id/bid` | User | Place bid |
| POST | `/:id/watch` | User | Add to watchlist |
| DELETE | `/:id/watch` | User | Remove from watchlist |

### Bids (`/api/bids`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auction/:id/highest` | — | Highest bid |
| GET | `/auction/:id/stats` | — | Bid statistics |
| GET | `/me` | User | User's bids |
| GET | `/me/active` | User | Active winning bids |
| PATCH | `/:id/cancel` | User | Cancel bid |

### Admin (`/api/admin`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | Admin | Dashboard stats |
| GET | `/system/health` | Admin | System health |
| POST | `/system/cleanup` | Admin | Run cleanup |
| GET | `/users` | Admin | List users |
| PATCH | `/users/:id/toggle-ban` | Admin | Ban/unban user |
| POST | `/auctions/:id/close` | Admin | Force close auction |
| DELETE | `/auctions/:id/hard-delete` | Admin | Permanently delete auction |
| POST | `/bids/:id/cancel` | Admin | Cancel bid |

## Testing

```bash
cd backend
npm test              # run all 24 tests
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Tests use MongoDB Memory Server — no external database required.