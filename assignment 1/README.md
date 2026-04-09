# Zeerostock Inventory Search

This project provides a small inventory search API and UI for searching surplus stock across suppliers.

## Run

1. Install Node.js
2. Start the app:

```bash
npm start
```

3. Open `http://localhost:3000`

## Search Logic

The backend exposes `GET /search` and reads from a static JSON file in `data/inventory.json`.

Supported query parameters:

- `q` for partial, case-insensitive product name matching
- `category` for exact category matching
- `minPrice` for lower price bound
- `maxPrice` for upper price bound

Multiple filters can be combined. If no filters are passed, the API returns all inventory items.

Invalid price values or a `minPrice` greater than `maxPrice` return a `400` response with a helpful error message.

## Performance Improvement

For a larger dataset, I would move search to a database with indexes on `name`, `category`, and `price`, or build an indexed search layer so the app does not scan every item on each request.
