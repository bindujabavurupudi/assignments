const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const dataFile = path.join(__dirname, "data", "inventory.json");

function loadInventory() {
  const raw = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(raw);
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypeMap = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const contentType = contentTypeMap[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function searchInventory(items, query) {
  const q = normalizeText(query.q);
  const category = normalizeText(query.category);
  const minPrice = parseNumber(query.minPrice);
  const maxPrice = parseNumber(query.maxPrice);

  if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
    return {
      error: "minPrice and maxPrice must be valid numbers.",
      statusCode: 400,
    };
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return {
      error: "minPrice cannot be greater than maxPrice.",
      statusCode: 400,
    };
  }

  const hasFilters =
    q !== "" ||
    category !== "" ||
    minPrice !== null ||
    maxPrice !== null;

  const results = items.filter((item) => {
    const itemName = normalizeText(item.name);
    const itemCategory = normalizeText(item.category);

    const matchesQuery = q === "" || itemName.includes(q);
    const matchesCategory = category === "" || itemCategory === category;
    const matchesMinPrice = minPrice === null || item.price >= minPrice;
    const matchesMaxPrice = maxPrice === null || item.price <= maxPrice;

    return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  return {
    results: hasFilters ? results : items,
    statusCode: 200,
  };
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && requestUrl.pathname === "/search") {
    try {
      const inventory = loadInventory();
      const outcome = searchInventory(inventory, Object.fromEntries(requestUrl.searchParams));

      if (outcome.error) {
        sendJson(res, outcome.statusCode, { error: outcome.error });
        return;
      }

      sendJson(res, 200, {
        count: outcome.results.length,
        results: outcome.results,
      });
    } catch (error) {
      sendJson(res, 500, { error: "Failed to search inventory." });
    }
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/") {
    sendFile(res, path.join(publicDir, "index.html"));
    return;
  }

  if (req.method === "GET") {
    const filePath = path.join(publicDir, requestUrl.pathname);
    if (filePath.startsWith(publicDir)) {
      sendFile(res, filePath);
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Inventory search app running at http://localhost:${PORT}`);
});
