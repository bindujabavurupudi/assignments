const form = document.getElementById("search-form");
const resetBtn = document.getElementById("reset-btn");
const resultsBody = document.getElementById("results");
const emptyState = document.getElementById("empty-state");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const categorySelect = document.getElementById("category");
const qInput = document.getElementById("q");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");

let allCategories = [];

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function setMessage(text) {
  statusEl.textContent = text;
}

function setError(text) {
  errorEl.textContent = text;
}

function renderRows(items) {
  resultsBody.innerHTML = "";

  for (const item of items) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${formatPrice(item.price)}</td>
      <td>${item.supplier}</td>
      <td>${item.location}</td>
    `;
    resultsBody.appendChild(row);
  }

  emptyState.classList.toggle("hidden", items.length !== 0);
}

function buildQuery() {
  const params = new URLSearchParams();

  const q = qInput.value.trim();
  const category = categorySelect.value.trim();
  const minPrice = minPriceInput.value.trim();
  const maxPrice = maxPriceInput.value.trim();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);

  return params.toString();
}

function validateInputs() {
  const minRaw = minPriceInput.value.trim();
  const maxRaw = maxPriceInput.value.trim();

  if (minRaw !== "" && Number.isNaN(Number(minRaw))) {
    return "Min price must be a valid number.";
  }

  if (maxRaw !== "" && Number.isNaN(Number(maxRaw))) {
    return "Max price must be a valid number.";
  }

  if (minRaw !== "" && maxRaw !== "" && Number(minRaw) > Number(maxRaw)) {
    return "Min price cannot be greater than max price.";
  }

  return "";
}

async function fetchResults() {
  const validationError = validateInputs();
  if (validationError) {
    setError(validationError);
    setMessage("");
    renderRows([]);
    return;
  }

  setError("");
  setMessage("Searching inventory...");

  const query = buildQuery();
  const response = await fetch(`/search${query ? `?${query}` : ""}`);
  const payload = await response.json();

  if (!response.ok) {
    setMessage("");
    setError(payload.error || "Something went wrong.");
    renderRows([]);
    return;
  }

  setError("");
  setMessage(`${payload.count} result${payload.count === 1 ? "" : "s"} found`);
  renderRows(payload.results);
}

function populateCategories(items) {
  const categories = [...new Set(items.map((item) => item.category))].sort();
  allCategories = categories;

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }
}

async function init() {
  const response = await fetch("/search");
  const payload = await response.json();
  populateCategories(payload.results || []);
  renderRows(payload.results || []);
  setMessage(`${payload.count || 0} results loaded`);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  fetchResults();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  setError("");
  fetchResults();
});

init().catch(() => {
  setError("Failed to load inventory data.");
  setMessage("");
});
