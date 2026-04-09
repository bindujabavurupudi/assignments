const express = require("express");
const { getDb } = require("../db");
const { isNonEmptyString, createError } = require("../utils/validation");

const router = express.Router();

router.post("/supplier", (req, res, next) => {
  try {
    const { name, city } = req.body;

    if (!isNonEmptyString(name)) {
      throw createError("name is required");
    }

    if (!isNonEmptyString(city)) {
      throw createError("city is required");
    }

    const db = getDb();
    const result = db
      .prepare("INSERT INTO suppliers (name, city) VALUES (?, ?)")
      .run(name.trim(), city.trim());

    const supplier = db
      .prepare("SELECT id, name, city FROM suppliers WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
