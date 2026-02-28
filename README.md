# SB Works

A full-stack freelancing platform where **clients** post projects, **freelancers** bid and deliver work, and **admins** oversee the platform. Includes real-time chat, submissions, reviews, and payment recording.

---

## What You Need Before Starting

- **Node.js** 18 or newer ([nodejs.org](https://nodejs.org))
- **MongoDB** running locally, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI
- **npm** (comes with Node) or **yarn**
- **Git** (to clone the repo)

---

## Before You Push to Git

- **Do not commit** any `.env` file (they contain secrets, API keys, and credentials).
- Only `.env.example` files are committed; they use placeholders. Copy them to `.env` locally and fill in your real values.
- The repo `.gitignore` is set up to exclude `.env` and similar files; double-check with `git status` before your first push.

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smartinterz
```

*(Replace `<your-repo-url>` with your actual Git URL, e.g. `https://github.com/yourusername/sb-works.git`.)*

---

## 2. Install Dependencies

Install both the backend and frontend:

```bash
# Backend
cd server
npm install
cd ..

# Frontend
cd client
npm install
cd ..
```

---

## 3. Environment Setup

Create environment files so the app can connect to MongoDB and use the correct URLs.

### Backend (`server/.env`)

Create `server/.env` (you can copy from `server/.env.example`):

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set:

| Variable     | Description |
|-------------|-------------|
| `PORT`      | Server port. Use **5001** if 5000 is already in use (e.g. on macOS). |
| `MONGO_URI` | MongoDB connection string, e.g. `mongodb://localhost:27017/sb-works` or your Atlas URI. |
| `JWT_SECRET`| A long random string used to sign JWTs. Change this in production. |
| `JWT_EXPIRE`| Token lifetime, e.g. `7d`. |
| `NODE_ENV`  | `development` or `production`. |
| `CLIENT_URL`| Frontend URL, e.g. `http://localhost:3000`. |

### Frontend (`client/.env`)

Create `client/.env` from the example (no secrets in the example file):

```bash
cd client
cp .env.example .env
```

Edit `client/.env` if needed. The port must match the `PORT` in `server/.env`.

**Important:** Never commit `.env` files to Git — they must stay local. Only `.env.example` (with placeholders) is safe to commit.

---

## 4. Create the Admin User

From the project root:

```bash
cd server
npm run seed:admin
```

This creates one admin account:

- **Email:** `admin@sbworks.com`
- **Password:** `admin123456`

---

## 5. Run the Application

You need **two terminals**: one for the backend, one for the frontend.

**Terminal 1 – Backend**

```bash
cd server
npm run dev
```

Wait until you see something like: `SB Works server running on port 5001` and `MongoDB Connected`.

**Terminal 2 – Frontend**

```bash
cd client
npm start
```

The browser should open to **http://localhost:3000**. If not, open that URL manually.

---

## 6. Log In and Explore

- **Admin:** `admin@sbworks.com` / `admin123456` (after running the seed step).
- **Client or Freelancer:** Use **Register** on the login page to create new accounts.

---

## Troubleshooting

| Problem | What to do |
|--------|------------|
| **Port 5000 already in use** | In `server/.env` set `PORT=5001`. In `client/.env` set `REACT_APP_API_URL=http://localhost:5001/api` and `REACT_APP_SOCKET_URL=http://localhost:5001`. Restart both servers. |
| **MongoDB connection error** | Ensure MongoDB is running locally, or that `MONGO_URI` in `server/.env` is correct (e.g. Atlas URI with correct password and IP allowlist). |
| **Frontend can’t reach the API** | Check that the port in `client/.env` matches `PORT` in `server/.env`. Restart the frontend after changing `.env`. |
| **“Not authorized” or 401** | Log out and log in again. If you just seeded admin, use `admin@sbworks.com` / `admin123456`. |

---

## Project Structure (Overview)

```
smartinterz/
├── server/          # Node.js + Express API, Socket.IO, MongoDB (Mongoose)
│   ├── config/      # DB connection, constants
│   ├── controllers/ # Request handlers
│   ├── middleware/  # Auth, validation, error handling
│   ├── models/      # Mongoose schemas (User, Project, Bid, Message, etc.)
│   ├── routes/      # API routes
│   ├── socket/      # Real-time messaging
│   ├── utils/       # Token, notifications, seed script
│   └── server.js    # Entry point
├── client/          # React app (Create React App)
│   ├── src/
│   │   ├── components/
│   │   ├── context/ # Auth state
│   │   ├── pages/   # Auth, Client, Freelancer, Admin, shared
│   │   ├── routes/  # App routes, protected routes
│   │   ├── services/# API calls (Axios)
│   │   ├── socket/  # Socket.IO client
│   │   └── hooks/
│   └── package.json
├── .gitignore
├── project_info.md  # Original product spec
└── README.md        # This file
```

---

## API Documentation

Base URL: `http://localhost:5001/api` (or your backend `PORT`).

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register (client/freelancer) | No |
| POST | `/auth/login` | Login | No |
| GET | `/auth/me` | Current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |

### Projects

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/projects` | List projects (filterable) | No | - |
| GET | `/projects/:id` | Get project | No | - |
| GET | `/projects/my` | My projects | Yes | Any |
| POST | `/projects` | Create project | Yes | Client |
| PUT | `/projects/:id` | Update project | Yes | Client |
| DELETE | `/projects/:id` | Delete project | Yes | Client/Admin |

### Bids

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/bids` | Place bid | Yes | Freelancer |
| GET | `/bids/my` | My bids | Yes | Freelancer |
| GET | `/bids/project/:projectId` | Bids for project | Yes | Any |
| PUT | `/bids/:id/accept` | Accept bid | Yes | Client |
| PUT | `/bids/:id/withdraw` | Withdraw bid | Yes | Freelancer |

### Messages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/messages` | Send message | Yes |
| GET | `/messages/project/:projectId` | Project messages | Yes |
| GET | `/messages/conversations` | My conversations | Yes |

### Submissions

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/submissions` | Submit work | Yes | Freelancer |
| GET | `/submissions/project/:projectId` | Project submissions | Yes | Any |
| PUT | `/submissions/:id/review` | Review (accept/revision) | Yes | Client |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reviews` | Create review | Yes |
| GET | `/reviews/project/:projectId` | Project reviews | No |
| GET | `/reviews/user/:userId` | User reviews | No |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | My notifications | Yes |
| PUT | `/notifications/:id/read` | Mark read | Yes |
| PUT | `/notifications/read-all` | Mark all read | Yes |

### Payments

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/payments` | Record payment | Yes | Client |
| GET | `/payments/project/:projectId` | Project payments | Yes | Client/Freelancer/Admin |
| GET | `/payments/my` | My payments | Yes | Any |

### Admin

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/admin/stats` | Dashboard stats | Yes | Admin |
| GET | `/admin/users` | List users | Yes | Admin |
| PUT | `/admin/users/:id/suspend` | Suspend/unsuspend user | Yes | Admin |
| GET | `/admin/projects` | List projects | Yes | Admin |
| PUT | `/admin/projects/:id/resolve-dispute` | Resolve dispute | Yes | Admin |

**Query params for GET /projects:** `status`, `category`, `search`, `minBudget`, `maxBudget`, `page`, `limit`, `sort`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, React Router v6, Axios, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT, bcryptjs |
| Validation | express-validator |

---

## User Roles

| Feature | Client | Freelancer | Admin |
|---------|--------|------------|-------|
| Post projects | ✓ | | |
| Browse projects | | ✓ | ✓ |
| Place bids | | ✓ | |
| Accept bids | ✓ | | |
| Submit work | | ✓ | |
| Review submissions | ✓ | | |
| Record payment | ✓ | | |
| Chat | ✓ | ✓ | |
| Write reviews | ✓ | ✓ | |
| Manage users / resolve disputes / stats | | | ✓ |

---


## License

This project is for educational and demonstration purposes.
