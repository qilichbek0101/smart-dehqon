let selectedProduct = null
// let role = window.role || "buyer" 
let role = localStorage.getItem("role") || "buyer"
let charts = {}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

/* ===============================
   MAHSULOTLARNI CHIQARISH
================================ */

async function renderProducts() {

  try {

    const container = document.getElementById("products")
    if (!container) return

    const res = await fetch("/products")
    if (!res.ok) throw new Error("Mahsulotlar yuklanmadi")
    const products = await res.json()
    if (products.length === 0) {
      container.innerHTML = `
    <p style="text-align:center;">Hozircha mahsulot yo‘q</p>
  `
      return
    }

    container.innerHTML = ""

    products.forEach(p => {

      const card = document.createElement("div")
      card.className = "product-card"

      card.innerHTML = `

<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
<h3>${escapeHtml(p.name.charAt(0).toUpperCase() + p.name.slice(1))}</h3>
<p>${escapeHtml(p.price)} so'm / ${escapeHtml(p.unit)}</p>

<div class="product-actions">
<button class="chart-btn">📈 Narx grafigi</button>
${role === "buyer" ? `<button class="order-btn">Buyurtma berish</button>` : ""}
</div>

<div class="ai-insight" id="ai-${p.id}">
  🤖 AI tahlil qilmoqda...
</div>

<canvas id="chart-${p.id}" style="display:none;height:200px;"></canvas>
`

      // 🔥 ORDER BUTTON (xavfsiz)
      const orderBtn = card.querySelector(".order-btn")
      if (orderBtn) {
        orderBtn.addEventListener("click", () => openOrder(p))
      }

      // 🔥 CHART BUTTON (xavfsiz)
      const chartBtn = card.querySelector(".chart-btn")
      if (chartBtn) {
        chartBtn.addEventListener("click", () => toggleChart(p))
      }

      container.appendChild(card)

      loadAIInsight(p)

    })



  } catch (err) {
    console.error("Mahsulot yuklash xato:", err)
  }

}

/* ===============================
   CARD ICHIDA GRAFIK
================================ */

async function toggleChart(product) {

  const canvas = document.getElementById(`chart-${product.id}`)

  if (canvas.style.display === "none") {

    canvas.style.display = "block"

    try {

      const productName = encodeURIComponent(product.name)

      const res = await fetch("/price-stats/" + productName)
      const data = await res.json()

      const predRes = await fetch("/price-predict/" + productName)
      const predictions = await predRes.json()

      if (!data.length) return

      const labels = data.map(d => d.date)
      const prices = data.map(d => d.price)

      let futureLabels = []
      for (let i = 1; i <= predictions.length; i++) {
        futureLabels.push("AI+" + i)
      }

      const allLabels = [...labels, ...futureLabels]

      const historyDataset = prices

      const predictionDataset = new Array(prices.length - 1).fill(null)
      predictionDataset.push(prices[prices.length - 1])
      predictionDataset.push(...predictions)

      if (charts[product.id]) {
        charts[product.id].destroy()
      }

      charts[product.id] = new Chart(canvas, {
        type: "line",
        data: {
          labels: allLabels,
          datasets: [
            {
              label: "Real narx",
              data: historyDataset,
              borderColor: "#2e7d32",
              borderWidth: 3,
              tension: 0.3
            },
            {
              label: "AI prognoz",
              data: predictionDataset,
              borderColor: "#ff9800",
              borderDash: [6, 6],
              borderWidth: 3,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: {
            y: {
              beginAtZero: false,
              suggestedMin: Math.min(...prices) - 1000,
              suggestedMax: Math.max(...prices) + 2000
            }
          }
        }
      })

    } catch (err) {
      console.error("Grafik xato:", err)
    }

  } else {
    canvas.style.display = "none"
  }

}

/* ===============================
   BUYURTMA
================================ */

function openOrder(product) {
  selectedProduct = product
  document.getElementById("popup").style.display = "flex"
}

function closePopup() {
  document.getElementById("popup").style.display = "none"
  document.getElementById("phoneInput").value = ""
}

async function submitOrder(event) {
  event.preventDefault();

  const form = event.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const phone = document.getElementById("phoneInput").value.trim();

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
    } else {
      alert("Yuborishda xatolik");
    }
  } catch (err) {
    console.error("Buyurtma xato:", err);
    alert("Server bilan ulanishda muammo");
  }
}
/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", renderProducts)

/* ===============================
   AI INSIGHT
================================ */

async function loadAIInsight(product) {

  try {

    const res = await fetch("/ai-insight/" + encodeURIComponent(product.name))
    const data = await res.json()

    const box = document.getElementById(`ai-${product.id}`)
    if (!box) return

    let badge = ""
    let badgeClass = ""
    let icon = ""

    if (data.trend === "up") icon = "📈"
    if (data.trend === "down") icon = "📉"
    if (data.trend === "stable") icon = "⚖️"

    if (role === "farmer") {
      if (data.trend === "up") {
        badge = "🟢 KUTING"
        badgeClass = "ai-up"
      }
      else if (data.trend === "down") {
        badge = "🔴 SOTING"
        badgeClass = "ai-down"
      }
      else {
        badge = "🟡 BARQAROR"
        badgeClass = "ai-stable"
      }
    } else {
      if (data.trend === "up") {
        badge = "⏳ TEZ ORADA QIMMATLASHADI"
        badgeClass = "ai-up"
      }
      else if (data.trend === "down") {
        badge = "💰 HOZIR ARZON"
        badgeClass = "ai-down"
      }
      else {
        badge = "📊 BARQAROR"
        badgeClass = "ai-stable"
      }
    }

    let message = data.message

    if (role === "buyer") {
      if (data.trend === "up") {
        message = "Narx oshishi kutilmoqda. Hozir olsangiz foydali."
      }
      else if (data.trend === "down") {
        message = "Narx tushmoqda. Hozir arzon narxda olish mumkin."
      }
    }

    box.innerHTML = `
<div class="ai-box-inner">

  <div class="ai-header">
    <span class="ai-badge ${badgeClass}">
      ${icon} ${badge}
    </span>
    <span class="ai-confidence">${data.confidence}%</span>
  </div>

  <div class="ai-message">
    ${escapeHtml(message)}
  </div>

  <div class="ai-explanation">
    ${escapeHtml(data.explanation || "")}
  </div>

  <div class="ai-bar">
    <div class="ai-fill" style="width:${data.confidence}%"></div>
  </div>

</div>
`

  } catch (err) {
    console.error("AI xato:", err)
  }

}

