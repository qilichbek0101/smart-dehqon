if (localStorage.getItem("admin") !== "true") {
  window.location = "login.html";
}

if (localStorage.getItem("role") !== "farmer") {
  alert("Faqat fermerlar uchun");
  window.location = "index.html";
}

function logout() {
  localStorage.clear();
  window.location = "login.html";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderDiseaseResult(data, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const medicines = (data.dori || [])
    .map((item) => `<li class="disease-pill">${escapeHtml(item)}</li>`)
    .join("");

  const advice = (data.tavsiyalar || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const metrics = data.features
    ? `
      <div class="disease-metrics">
        <span>Yashil: ${data.features.green_ratio}%</span>
        <span>Sariq: ${data.features.yellow_ratio}%</span>
        <span>Jigarrang: ${data.features.brown_ratio}%</span>
        <span>Oq qatlam: ${data.features.white_ratio}%</span>
        <span>Qora dog': ${data.features.dark_ratio}%</span>
      </div>
    `
    : "";

  target.innerHTML = `
    <div class="disease-result-card">
      <div class="disease-result-head">
        <div>
          <h3>${escapeHtml(data.kasallik || "Natija tayyor")}</h3>
          <p class="disease-confidence">Ishonchlilik: ${escapeHtml(data.confidence || 0)}%</p>
        </div>
        <span class="disease-badge">AI</span>
      </div>

      <p class="disease-reason">${escapeHtml(data.sabab || "Sabab aniqlanmadi")}</p>
      ${metrics}

      <div class="disease-columns">
        <div>
          <h4>Tavsiyalar</h4>
          <ul>${advice}</ul>
        </div>
        <div>
          <h4>Tavsiya etilgan vositalar</h4>
          <ul class="disease-pills">${medicines || "<li>Hozircha tavsiya yo'q</li>"}</ul>
        </div>
      </div>

      ${
        data.note
          ? `<p class="disease-note">${escapeHtml(data.note)}</p>`
          : ""
      }
    </div>
  `;
}

function addProduct() {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const unit = document.getElementById("unit").value;
  const file = document.getElementById("imageInput").files[0];

  if (!name || !price || !file) {
    alert("Ma'lumotlarni to'liq kiriting");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("unit", unit);
  formData.append("image", file);

  fetch("/add-product", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        alert("Mahsulot qo'shildi");
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("imageInput").value = "";
        renderAdminProducts();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    })
    .catch(() => alert("Mahsulotni saqlashda xatolik bo'ldi"));
}

function renderAdminProducts() {
  fetch("/products")
    .then((res) => res.json())
    .then((products) => {
      const box = document.getElementById("adminProducts");
      if (!box) return;

      box.innerHTML = "";

      products.forEach((p) => {
        box.innerHTML += `
          <div class="admin-product">
            <img src="${escapeHtml(p.image)}" class="admin-img">
            <div class="admin-info">
              <h3>${escapeHtml(p.name)}</h3>
              <p>${escapeHtml(p.price)} so'm / ${escapeHtml(p.unit)}</p>
            </div>
            <div class="admin-actions">
              <button onclick="editProduct(${p.id}, ${JSON.stringify(p.name)}, ${p.price}, ${JSON.stringify(p.unit)})" class="edit-btn">Edit</button>
              <button onclick="deleteProduct(${p.id})" class="delete-btn">Delete</button>
            </div>
          </div>
        `;
      });
    });
}

function deleteProduct(id) {
  if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return;

  fetch(`/delete-product/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "deleted") {
        alert("Mahsulot o'chirildi");
        renderAdminProducts();
      }
    })
    .catch((err) => console.error("Delete error:", err));
}

function editProduct(id, name, price, unit) {
  const newName = prompt("Mahsulot nomi:", name);
  const newPrice = prompt("Narx:", price);
  const newUnit = prompt("Birlik:", unit);

  if (!newName || !newPrice) return;

  fetch(`/update-product/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newName,
      price: newPrice,
      unit: newUnit,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Mahsulot yangilandi");
      renderAdminProducts();
    });
}

function renderOrders() {
  fetch("/orders")
    .then((res) => res.json())
    .then((orders) => {
      const container = document.getElementById("ordersTable");
      if (!container) return;

      container.innerHTML = "";

      orders.forEach((o) => {
        container.innerHTML += `
          <tr>
            <td>${escapeHtml(o.product)}</td>
            <td>${escapeHtml(o.price)} so'm</td>
            <td>${escapeHtml(o.phone)}</td>
            <td>${escapeHtml(o.created_at)}</td>
            <td>
              <a href="tel:${escapeHtml(o.phone)}">
                <button class="call-btn">Qo'ng'iroq</button>
              </a>
            </td>
          </tr>
        `;
      });
    });
}

function loadStats() {
  fetch("/orders")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("totalOrders").innerText = data.length;

      let today = 0;
      let revenue = 0;
      const todayDate = new Date().toISOString().slice(0, 10);

      data.forEach((o) => {
        revenue += Number(o.price);
        if (String(o.created_at).startsWith(todayDate)) {
          today += 1;
        }
      });

      document.getElementById("todayOrders").innerText = today;
      document.getElementById("totalRevenue").innerText = revenue;
    });
}

async function loadTopProducts() {
  try {
    const res = await fetch("/top-products");
    const data = await res.json();

    const box = document.getElementById("topProducts");
    if (!box) return;

    box.innerHTML = "";

    data.slice(0, 5).forEach((p) => {
      const label =
        p.demand === "high"
          ? "Yuqori talab"
          : p.demand === "medium"
            ? "O'rtacha"
            : "Past talab";

      box.innerHTML += `<li>${escapeHtml(p.product)} - ${label} (${escapeHtml(p.orders)})</li>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadCropRecommendation() {
  try {
    const res = await fetch("/crop-recommendation");
    const data = await res.json();

    const box = document.getElementById("cropRecommend");
    if (!box) return;

    box.innerHTML = "";

    data.slice(0, 5).forEach((p) => {
      box.innerHTML += `<li>${escapeHtml(p[0])}</li>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadPlantAdvice() {
  try {
    const res = await fetch("/top-products");
    const data = await res.json();
    data.sort((a, b) => b.orders - a.orders);

    const top3 = data.slice(0, 3);
    const container = document.getElementById("aiPlantBox");
    if (!container) return;

    container.innerHTML = "<h3>AI ekish tavsiyasi</h3>";

    top3.forEach((p, i) => {
      const label = i === 0 ? "Eng foydali" : i === 1 ? "Barqaror" : "Zaxira variant";
      container.innerHTML += `
        <div class="ai-plant-box">
          <strong>${i + 1}.</strong> ${escapeHtml(p.product)} - ${label}<br>
          ${escapeHtml(p.orders)} buyurtma
        </div>
      `;
    });
  } catch (err) {
    console.error("AI tavsiya xato:", err);
  }
}

async function askAI() {
  const text = document.getElementById("aiInput").value.trim();

  if (!text) {
    alert("Savol yozing");
    return;
  }

  try {
    const res = await fetch("/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    renderDiseaseResult(data, "aiResult");
  } catch (err) {
    console.error(err);
    document.getElementById("aiResult").innerText = "Xatolik";
  }
}

function showDiseasePreview(file) {
  const preview = document.getElementById("diseasePreview");
  if (!preview) return;

  if (!file) {
    preview.innerHTML = "";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  preview.innerHTML = `
    <img src="${objectUrl}" alt="Kasallik tahlili rasmi" class="disease-preview-image">
  `;
}

async function analyzeDiseaseImage() {
  const input = document.getElementById("diseaseImageInput");
  const resultBox = document.getElementById("diseaseResult");
  const file = input?.files?.[0];

  if (!file) {
    alert("Avval rasm tanlang");
    return;
  }

  showDiseasePreview(file);
  resultBox.innerHTML = `<div class="disease-loading">Rasm tahlil qilinmoqda...</div>`;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("/analyze-disease-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Tahlil xatoligi");
    }

    renderDiseaseResult(data, "diseaseResult");
  } catch (err) {
    console.error(err);
    resultBox.innerHTML = `<div class="disease-error">${escapeHtml(err.message || "Xatolik")}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAdminProducts();
  renderOrders();
  loadStats();
  loadTopProducts();
  loadCropRecommendation();
  loadPlantAdvice();

  const diseaseInput = document.getElementById("diseaseImageInput");
  if (diseaseInput) {
    diseaseInput.addEventListener("change", (event) => {
      showDiseasePreview(event.target.files?.[0]);
    });
  }
});
