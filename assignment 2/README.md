# Inventory Database + APIs

This project is split into two folders:

- `backend/` for the API and database
- `frontend/` for the browser UI

## Folder Structure

```text
.
├─ backend/
│  ├─ package.json
│  ├─ data/
│  │  └─ inventory.db
│  └─ src/
│     ├─ app.js
│     ├─ db.js
│     ├─ routes/
│     │  ├─ inventory.js
│     │  └─ suppliers.js
│     └─ utils/
│        └─ validation.js
└─ frontend/
   ├─ index.html
   ├─ styles.css
   └─ app.js
```

## Database Schema

### `suppliers`

- `id` - primary key
- `name` - supplier name
- `city` - supplier city

### `inventory`

- `id` - primary key
- `supplier_id` - foreign key to `suppliers.id`
- `product_name` - inventory item name
- `quantity` - must be `>= 0`
- `price` - must be `> 0`

### Relationship

One supplier can have many inventory items.

The `inventory.supplier_id` column enforces this relationship and uses a foreign key constraint.

## Why SQL

I chose SQL because this assignment has a clear relational model:

- suppliers have many inventory items
- inventory rows must belong to a valid supplier
- the required grouped query is naturally expressed with joins and aggregates

SQLite keeps the project lightweight while still giving us real relational constraints.

## API Endpoints

### `POST /supplier`

Create a supplier.

Example request:

```json
{
  "name": "ABC Traders",
  "city": "Mumbai"
}
```

### `POST /inventory`

Create an inventory item.

Rules:

- `supplier_id` must exist
- `quantity >= 0`
- `price > 0`

Example request:

```json
{
  "supplier_id": 1,
  "product_name": "Steel Rods",
  "quantity": 50,
  "price": 120.5
}
```

### `GET /inventory`

Returns all inventory items with supplier details.

### `GET /inventory/grouped-by-supplier`

Returns all inventory grouped by supplier and sorted by total inventory value.

## Required Query

The grouped query is implemented in `GET /inventory/grouped-by-supplier`.

It returns:

- supplier details
- total quantity per supplier
- total inventory value per supplier
- inventory items under each supplier

The result is sorted by `total_inventory_value` in descending order.

## Indexing / Optimization Suggestion

Add an index on `inventory.supplier_id`.

This improves join and lookup performance when:

- validating that a supplier has inventory
- grouping inventory by supplier
- fetching inventory for a specific supplier

This project already creates that index automatically.

## Run It

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Start the server:

```bash
npm run dev
```

The backend serves the frontend automatically at `http://localhost:3000`.

## Quick Test Flow

1. Open `http://localhost:3000`
2. Create a supplier with the form
3. Create one or more inventory records with the form
4. View all inventory with `GET /inventory`
5. View grouped totals with `GET /inventory/grouped-by-supplier`
