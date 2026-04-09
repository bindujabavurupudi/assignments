# Assignments Repository

This repository contains two separate assignment projects:

- `assignment 1/` - a small inventory search API with a browser UI
- `assignment 2/` - an inventory database app with a backend API and frontend

## Repository Layout

```text
.
|-- assignment 1/
`-- assignment 2/
```

## Assignment 1

`assignment 1/` is a Node.js app for searching inventory data from a static JSON file.

Main features:

- search by product name
- filter by category
- filter by price range
- browser-based UI served by the backend

Run it:

```bash
cd "assignment 1"
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Assignment 2

`assignment 2/` is an inventory management app built with:

- `backend/` for the API and SQLite database
- `frontend/` for the browser UI

Main features:

- create suppliers
- create inventory items
- view all inventory
- view grouped inventory by supplier

Run it:

```bash
cd "assignment 2/backend"
npm install
npm run dev
```

The backend serves the frontend automatically at:

```text
http://localhost:3000
```

## Notes

- Each assignment has its own README with more detailed documentation.
- The top-level repository is only a container for both projects.
- `node_modules/` and database files are ignored by Git where needed.
