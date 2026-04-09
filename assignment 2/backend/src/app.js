const path = require("path");
const express = require("express");
const { initDatabase } = require("./db");
const supplierRoutes = require("./routes/suppliers");
const inventoryRoutes = require("./routes/inventory");

initDatabase();

const app = express();
const frontendDir = path.join(__dirname, "..", "..", "frontend");

app.use(express.json());
app.use(express.static(frontendDir));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.use(supplierRoutes);
app.use(inventoryRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
