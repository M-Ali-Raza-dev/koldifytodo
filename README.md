# Koldify TodoList

React + Vite frontend with Node.js/Express API, MongoDB persistence, and JWT authentication.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind
- Backend: Express, Mongoose, JWT, bcrypt
- Database: MongoDB Atlas

## Environment

Create `.env` from `.env.example` and set:

```sh
MONGODB_URI="..."
MONGODB_DB_NAME="koldify_todolist"
JWT_SECRET="..."
PORT=5000
VITE_API_URL="http://localhost:5000/api"
```

## Run

```sh
npm install
npm run dev
```

This starts:

- API server at `http://localhost:5000`
- Frontend at `http://localhost:8080`

## Auth and Data

- Login works only for users stored in MongoDB.
- Signup creates a new MongoDB user.
- Tasks are created in MongoDB and loaded from MongoDB.
