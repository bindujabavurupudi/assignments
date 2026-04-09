const express = require("express");
const { getDb } = require("../db");
const {
  isNonEmptyString,
  parsePositiveNumber,
  parseNonNegativeInteger,
  createError,
} = require("../utils/validation");

const router = express.Router();

router.post("/inventory", (req, res, next) => {
  try {
    const { supplier_id, product_name, quantity, price } = req.body;

    const supplierId = parseNonNegativeInteger(supplier_id);
    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      throw createError("supplier_id must be a valid positive integer");
    }

    if (!isNonEmptyString(product_name)) {
      throw createError("product_name is required");
    }

    const parsedQuantity = parseNonNegativeInteger(quantity);
    if (Number.isNaN(parsedQuantity)) {
      throw createError("quantity must be an integer greater than or equal to 0");
    }

    const parsedPrice = parsePositiveNumber(price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      throw createError("price must be greater than 0");
    }

    const db = getDb();
    const supplier = db
      .prepare("SELECT id, name, city FROM suppliers WHERE id = ?")
      .get(supplierId);

    if (!supplier) {
      throw createError("supplier_id does not match any supplier", 404);
    }

    const result = db
      .prepare(
        `INSERT INTO inventory (supplier_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?)`
      )
      .run(supplierId, product_name.trim(), parsedQuantity, parsedPrice);

    const inventoryItem = db
      .prepare(
        `SELECT id, supplier_id, product_name, quantity, price
         FROM inventory
         WHERE id = ?`
      )
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Inventory item created successfully",
      inventory: inventoryItem,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/inventory", (req, res, next) => {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `
        SELECT
          i.id,
          i.supplier_id,
          s.name AS supplier_name,
          s.city AS supplier_city,
          i.product_name,
          i.quantity,
          i.price,
          ROUND(i.quantity * i.price, 2) AS inventory_value
        FROM inventory i
        INNER JOIN suppliers s ON s.id = i.supplier_id
        ORDER BY i.id ASC
        `
      )
      .all();

    res.json({
      count: rows.length,
      inventory: rows,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/inventory/grouped-by-supplier", (req, res, next) => {
  try {
    const db = getDb();
    const suppliers = db
      .prepare(
        `
        SELECT
          s.id,
          s.name,
          s.city,
          COALESCE(SUM(i.quantity), 0) AS total_quantity,
          COALESCE(ROUND(SUM(i.quantity * i.price), 2), 0) AS total_inventory_value
        FROM suppliers s
        LEFT JOIN inventory i ON i.supplier_id = s.id
        GROUP BY s.id, s.name, s.city
        ORDER BY total_inventory_value DESC, s.name ASC
        `
      )
      .all();

    const itemsBySupplier = db
      .prepare(
        `
        SELECT
          supplier_id,
          id,
          product_name,
          quantity,
          price,
          ROUND(quantity * price, 2) AS inventory_value
        FROM inventory
        ORDER BY supplier_id ASC, inventory_value DESC, id ASC
        `
      )
      .all();

    const grouped = suppliers.map((supplier) => ({
      supplier_id: supplier.id,
      name: supplier.name,
      city: supplier.city,
      total_quantity: supplier.total_quantity,
      total_inventory_value: supplier.total_inventory_value,
      items: itemsBySupplier
        .filter((item) => item.supplier_id === supplier.id)
        .map((item) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          inventory_value: item.inventory_value,
        })),
    }));

    res.json({
      count: grouped.length,
      suppliers: grouped,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
