# Student Management System — MERN Stack

A beginner-friendly CRUD application for college practical examinations. It uses React + Vite for the interface, Express + Node.js for the REST API, and MongoDB + Mongoose for persistent storage.

## Features

- Add, list, edit, and delete student records.
- Search by student name, course, year, or email.
- Client-side and server-side validation.
- Loading, success, error, and empty-state messages.
- Confirmation before deleting a record.
- MongoDB-generated `_id` values are used for React keys and API requests.
- Responsive interface with plain CSS.
- Health-check endpoint for checking the API.

## Technologies

- Frontend: React, Vite, JavaScript, Axios, CSS
- Backend: Node.js, Express, CORS, dotenv
- Database: MongoDB Community Server or MongoDB Atlas, Mongoose

## Folder structure

```text
student-management-mern/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── .env.example
│   └── models/
│       └── Student.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       └── styles.css
├── .gitignore
└── README.md
```

## Prerequisites

Install:
1. Node.js (a current LTS release is recommended).
2. npm (included with Node.js).
3. MongoDB Community Server running locally, or a MongoDB Atlas cluster.
4. VS Code or another editor.

Check your installations:

```bash
node --version
npm --version
```

## Installation and setup

Open the project folder in VS Code. You will run the backend and frontend in separate terminals.

### 1. Configure the backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to a new file named `backend/.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

The default local configuration is:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_management
FRONTEND_URL=http://localhost:5173
```

Make sure MongoDB Community Server is running before starting the backend. The application connects to MongoDB before it begins listening for API requests.

Start the backend from the `backend` folder:

```bash
node app.js
```

Expected terminal output:

```text
MongoDB connected successfully.
Student Management API running at http://localhost:5000
Allowed frontend origin: http://localhost:5173
```

You can also use `npm run dev` to restart the backend automatically when its files change.

### 2. Configure and start the frontend

Open a **second terminal** in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open this address in your browser:

http://localhost:5173

The frontend's default API base URL is `http://localhost:5000/api`. To override it, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`. Restart Vite after changing environment variables.

## MongoDB Atlas setup

1. Create a MongoDB Atlas cluster and a database user.
2. In Atlas Network Access, allow the IP address of the computer running the backend. Avoid allowing access from everywhere except for temporary learning/testing when you understand the security implications.
3. Copy the application's connection string from Atlas.
4. Replace `MONGODB_URI` in `backend/.env` with that connection string. Substitute your actual database username/password and database name. URL-encode special characters in the username or password when required.
5. Keep the connection string in the backend `.env` only. Never place database credentials in React files or `frontend/.env`.
6. Restart the backend.

Example format (replace the placeholders; this is not a working credential):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/student_management?retryWrites=true&w=majority
```

Do not commit `backend/.env` or share it publicly. `.gitignore` excludes environment files while keeping `.env.example` available.

## REST API endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check whether the API is running |
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student by MongoDB ObjectId |
| DELETE | `/api/students/:id` | Delete a student by MongoDB ObjectId |

### Example POST / PUT JSON body

```json
{
  "name": "Anu Kumar",
  "course": "BSc Computer Science",
  "year": 3,
  "email": "anu@example.com"
}
```

The `year` field must be a whole number from 1 to 10. The UI offers years 1–5 by default; you can change those options for a different course structure.

### Response and error behavior

- Successful creation returns HTTP `201`.
- Successful reads, updates, and deletes return HTTP `200`.
- Invalid request data or malformed MongoDB IDs return HTTP `400`.
- A valid ID that does not match a student returns HTTP `404`.
- Unexpected server/database errors return HTTP `500`.
- Student documents use MongoDB's `_id`, not an array-style numeric `id`.

## Test CRUD operations with Postman

1. Start MongoDB and the backend.
2. Open Postman and create requests using the base URL `http://localhost:5000`.

### A. Health check

- Method: `GET`
- URL: `http://localhost:5000/api/health`
- Expected: a JSON response confirming the API is running.

### B. Create a student

- Method: `POST`
- URL: `http://localhost:5000/api/students`
- Body → raw → JSON:

```json
{
  "name": "Anu Kumar",
  "course": "BSc Computer Science",
  "year": 3,
  "email": "anu@example.com"
}
```

Expected: `201 Created`. Copy the returned `data._id` for update/delete testing.

### C. Read students

- Method: `GET`
- URL: `http://localhost:5000/api/students`
- Expected: a JSON array in the `data` property.

### D. Update a student

- Method: `PUT`
- URL: `http://localhost:5000/api/students/PASTE_MONGODB_OBJECT_ID_HERE`
- Body → raw → JSON:

```json
{
  "name": "Anu Kumar Updated",
  "course": "BSc Computer Science",
  "year": 3,
  "email": "anu.updated@example.com"
}
```

Replace the placeholder with the actual `_id` returned by the POST request.

### E. Delete a student

- Method: `DELETE`
- URL: `http://localhost:5000/api/students/PASTE_MONGODB_OBJECT_ID_HERE`

Use the same real MongoDB `_id`. Then send GET `/api/students` to verify the record is gone.

## Common errors and solutions

**MongoDB connection failed / ECONNREFUSED**
- Ensure MongoDB Community Server is installed and running.
- Check `MONGODB_URI` in `backend/.env`.
- For Atlas, check the database user, password, network access list, and connection string.

**Frontend cannot reach the API**
- Start the backend on port 5000.
- Check `VITE_API_URL` if you created `frontend/.env`.
- Restart Vite after changing environment variables.
- Check `FRONTEND_URL` in `backend/.env` matches `http://localhost:5173`, then restart the backend.

**Port 5000 is already in use**
- Stop the other process using the port, or change `PORT` in `backend/.env` and update `VITE_API_URL` in `frontend/.env` to match. Restart both services. The API URL includes `/api`.

**Invalid student ID**
- Use the MongoDB `_id` returned by the API, not the shortened ID displayed in the table and not a numeric `id`.
- The interface retains the full `_id` internally.

**Validation error**
- Enter a name of at least two characters, a course, a whole-number year from 1 to 10, and a valid email address.

**CORS error**
- Make sure the frontend is opened at `http://localhost:5173` and `FRONTEND_URL` matches exactly, including protocol and port.

## Reuse this project for other CRUD assignments

The reusable pattern is:

**React form → Axios request → Express REST API → Mongoose model → MongoDB → JSON response → React UI**

To convert the app, update the model properties, form state and inputs, validation, table columns, search fields, and the backend create/update payloads. Keep `_id` as the record identifier.

| Topic | Suggested fields |
|---|---|
| Student Management | `name`, `course`, `year`, `email` |
| Movie Listing | `title`, `genre`, `releaseYear`, `rating` |
| Book Management | `title`, `author`, `category`, `publishedYear` |
| Product Management | `name`, `category`, `price`, `quantity` |
| Employee Management | `name`, `department`, `role`, `email` |

For example, to make a Movie Listing app:
1. Change the Mongoose schema from `name/course/year/email` to `title/genre/releaseYear/rating`.
2. Update `emptyForm`, form inputs, and `handleSubmit` in `frontend/src/App.jsx`.
3. Update the table headings and row values.
4. Update `filteredStudents` to search the new movie fields.
5. Update the POST and PUT handlers in `backend/app.js` to accept the new fields.
6. Rename the model and API paths if desired, and update the README/API tests.
7. Add appropriate validation for the new fields.

Use the same CRUD route pattern and keep all data operations connected to MongoDB rather than using a static array.

## Notes

- This project is a learning/practical-exam starter, not a hardened production service.
- The API currently allows one configured frontend origin, as intended for local development.
- The shortened ID shown in the table is only for display. All edits and deletes use the complete MongoDB `_id`.
