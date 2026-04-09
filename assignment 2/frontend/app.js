const supplierForm = document.getElementById("supplierForm");
const inventoryForm = document.getElementById("inventoryForm");
const supplierResult = document.getElementById("supplierResult");
const inventoryResult = document.getElementById("inventoryResult");
const groupedList = document.getElementById("groupedList");
const refreshButton = document.getElementById("refreshButton");
const healthText = document.getElementById("healthText");

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function renderGroupedSuppliers(suppliers) {
  if (!suppliers.length) {
    groupedList.innerHTML = '<p class="meta">No inventory yet. Add a supplier and some items first.</p>';
    return;
  }

  groupedList.innerHTML = suppliers
    .map(
      (supplier) => `
        <article class="supplier-block">
          <div class="supplier-top">
            <div>
              <h3>${supplier.name}</h3>
              <div class="meta">Supplier #${supplier.supplier_id} · ${supplier.city}</div>
            </div>
            <div class="meta">
              Total value: ${Number(supplier.total_inventory_value).toLocaleString()} ·
              Total qty: ${supplier.total_quantity}
            </div>
          </div>
          <div class="items">
            ${supplier.items
              .map(
                (item) => `
                  <div class="item">
                    <div>
                      <strong>${item.product_name}</strong>
                      <span class="meta">Qty ${item.quantity} · Price ${Number(item.price).toLocaleString()}</span>
                    </div>
                    <div class="meta">Value ${Number(item.inventory_value).toLocaleString()}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

async function loadGroupedInventory() {
  const data = await requestJson("/inventory/grouped-by-supplier");
  renderGroupedSuppliers(data.suppliers);
}

async function checkHealth() {
  try {
    await requestJson("/health");
    healthText.textContent = "Backend connected";
  } catch (error) {
    healthText.textContent = "Backend unavailable";
  }
}

supplierForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(supplierForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const data = await requestJson("/supplier", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    supplierResult.textContent = formatJson(data);
    supplierForm.reset();
    await loadGroupedInventory();
  } catch (error) {
    supplierResult.textContent = error.message;
  }
});

inventoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(inventoryForm);
  const payload = Object.fromEntries(formData.entries());
  payload.supplier_id = Number(payload.supplier_id);
  payload.quantity = Number(payload.quantity);
  payload.price = Number(payload.price);

  try {
    const data = await requestJson("/inventory", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    inventoryResult.textContent = formatJson(data);
    inventoryForm.reset();
    await loadGroupedInventory();
  } catch (error) {
    inventoryResult.textContent = error.message;
  }
});

refreshButton.addEventListener("click", async () => {
  try {
    await loadGroupedInventory();
  } catch (error) {
    groupedList.innerHTML = `<p class="meta">${error.message}</p>`;
  }
});

checkHealth();
loadGroupedInventory().catch((error) => {
  groupedList.innerHTML = `<p class="meta">${error.message}</p>`;
});
