let selectedProduct = null;
let priceChart = null;

/* ===============================
   MAHSULOTLARNI CHIQARISH
================================ */

async function renderProducts() {
  try {
    const res = await fetch("/products");
    const products = await res.json();

    const container = document.getElementById("products");
    if (!container) return;

    container.innerHTML = "";

    products.forEach(p => {

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.price} so'm / ${p.unit}</p>
        <button class="order-btn">Buyurtma berish</button>
      `;

      card.querySelector(".order-btn")
          .addEventListener("click", () => openOrder(p));

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Mahsulot yuklashda xatolik:", err);
  }
}

/* ===============================
   NARX GRAFIK
================================ */

async function loadChart(productName) {
  try {

    const res = await fetch(`/price-stats/${productName}`);
    const data = await res.json();

    if (!data.length) return;

    const labels = data.map(d => d.date);
    const prices = data.map(d => d.price);

    const ctx = document.getElementById("priceChart");
    if (!ctx) return;

    // Eski grafikni o‘chirish
    if (priceChart) {
      priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Narx o‘zgarishi",
          data: prices,
          borderWidth: 2
        }]
      }
    });

  } catch (err) {
    console.error("Grafik yuklashda xatolik:", err);
  }
}

/* ===============================
   BUYURTMA OCHISH
================================ */

function openOrder(product) {
  selectedProduct = product;

  const popup = document.getElementById("popup");
  if (popup) popup.style.display = "flex";

  loadChart(product.name);
}

/* ===============================
   POPUP YOPISH
================================ */

function closePopup() {
  const popup = document.getElementById("popup");
  if (popup) popup.style.display = "none";

  const phoneInput = document.getElementById("phoneInput");
  if (phoneInput) phoneInput.value = "";
}

/* ===============================
   BUYURTMA YUBORISH
================================ */

async function submitOrder() {

  const phoneInput = document.getElementById("phoneInput");
  if (!phoneInput) return;

  const phone = phoneInput.value.trim();

  if (!phone) {
    alert("Telefon kiriting");
    return;
  }

  const data = {
    product: selectedProduct.name,
    price: selectedProduct.price,
    phone: phone
  };

  try {

    const res = await fetch("/send-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.status === "ok") {
      alert("Buyurtma yuborildi");
      closePopup();
    }

  } catch (err) {
    console.error("Buyurtma yuborishda xatolik:", err);
  }
}

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", renderProducts);