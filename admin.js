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

function showServicePanel(serviceId, options = {}) {
  const panels = Array.from(document.querySelectorAll("[data-service-panel]"));
  const buttons = Array.from(document.querySelectorAll("[data-service-target]"));
  const fallbackService = "disease";
  const hasPanel = panels.some((panel) => panel.dataset.servicePanel === serviceId);
  const activeService = hasPanel ? serviceId : fallbackService;

  panels.forEach((panel) => {
    const isActive = panel.dataset.servicePanel === activeService;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });

  buttons.forEach((button) => {
    const isActive = button.dataset.serviceTarget === activeService;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (options.updateHash && window.history?.replaceState) {
    window.history.replaceState(null, "", `#${activeService}`);
  }

  if (options.scroll) {
    const activePanel = panels.find((panel) => panel.dataset.servicePanel === activeService);
    activePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
    .then((res) => {
      if (!res.ok) {
        throw new Error("Mahsulotlar yuklanmadi");
      }
      return res.json();
    })
    .then((products) => {
      const box = document.getElementById("adminProducts");
      if (!box) return;

      box.innerHTML = "";

      if (!products.length) {
        box.innerHTML = `<p class="empty-text">Hozircha mahsulot yo'q</p>`;
        return;
      }

      products.forEach((p) => {
        const row = document.createElement("div");
        row.className = "admin-product";

        const image = document.createElement("img");
        image.className = "admin-img";
        image.src = p.image || "image/logo3.jpg";
        image.alt = p.name || "Mahsulot rasmi";

        const info = document.createElement("div");
        info.className = "admin-info";

        const title = document.createElement("h3");
        title.textContent = p.name;

        const meta = document.createElement("p");
        meta.textContent = `${p.price} so'm / ${p.unit}`;

        info.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "admin-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
          editProduct(p.id, p.name, p.price, p.unit);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteProduct(p.id));

        actions.append(editBtn, deleteBtn);
        row.append(image, info, actions);
        box.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("Products load error:", err);
      const box = document.getElementById("adminProducts");
      if (box) {
        box.innerHTML = `<p class="error-text">Mahsulotlarni yuklashda xatolik bo'ldi</p>`;
      }
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
  if (newName === null) return;

  const newPrice = prompt("Narx:", price);
  if (newPrice === null) return;

  const newUnit = prompt("Birlik:", unit);
  if (newUnit === null) return;

  const cleanName = newName.trim();
  const cleanPrice = newPrice.trim();
  const cleanUnit = newUnit.trim() || "kg";

  if (!cleanName || !cleanPrice) {
    alert("Nom va narxni to'liq kiriting");
    return;
  }

  if (!Number.isFinite(Number(cleanPrice)) || Number(cleanPrice) <= 0) {
    alert("Narx 0 dan katta raqam bo'lishi kerak");
    return;
  }

  fetch(`/update-product/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: cleanName,
      price: cleanPrice,
      unit: cleanUnit,
    }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Mahsulot yangilanmadi");
      }
      return data;
    })
    .then(() => {
      alert("Mahsulot yangilandi");
      renderAdminProducts();
    })
    .catch((err) => {
      console.error("Update error:", err);
      alert(err.message || "Mahsulotni yangilashda xatolik bo'ldi");
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
    const res = await fetch("/crop-recommendation");
    const data = await res.json();

    const top3 = data.slice(0, 3).map((item) => ({
      product: item[0],
      score: Math.round(Number(item[1]) || 0),
    }));
    const container = document.getElementById("aiPlantBox");
    if (!container) return;

    container.innerHTML = `
      <div class="ai-panel-head">
        <span class="ai-panel-kicker">AI tavsiya</span>
        <h2>AI ekish tavsiyasi</h2>
        <p>Buyurtmalar va talabga qarab qaysi mahsulot foydaliroq ekanini kuzating.</p>
      </div>
    `;

    if (!top3.length) {
      container.innerHTML += `
        <div class="ai-empty-state">
          Hali mahsulot yo'q. Mahsulot qo'shilgach, AI eng foydali ekinlarni tartiblaydi.
        </div>
      `;
      return;
    }

    const list = document.createElement("div");
    list.className = "ai-plant-list";

    top3.forEach((p, i) => {
      const label = i === 0 ? "Eng foydali" : i === 1 ? "Barqaror" : "Zaxira variant";
      const card = document.createElement("div");
      card.className = `ai-plant-box ai-plant-rank-${i + 1}`;
      card.innerHTML = `
        <span class="ai-plant-rank">${i + 1}</span>
        <span class="ai-plant-info">
          <strong>${escapeHtml(p.product)}</strong>
          <small>${label}</small>
        </span>
        <span class="ai-plant-orders">AI ball: ${escapeHtml(p.score)}</span>
      `;
      list.appendChild(card);
    });

    container.appendChild(list);
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
    const result = document.getElementById("aiResult");
    if (result) {
      result.innerHTML = `<div class="ai-loading-card">AgroAI javob tayyorlamoqda...</div>`;
    }

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
  const serviceButtons = document.querySelectorAll("[data-service-target]");
  const initialService = window.location.hash ? window.location.hash.slice(1) : "disease";

  showServicePanel(initialService, { scroll: false });

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showServicePanel(button.dataset.serviceTarget || "disease", {
        scroll: true,
        updateHash: true,
      });
    });
  });

  renderAdminProducts();
  renderOrders();
  loadStats();
  loadTopProducts();
  loadCropRecommendation();
  loadPlantAdvice();

  document.querySelectorAll("[data-ai-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById("aiInput");
      if (!input) return;
      input.value = button.dataset.aiQuestion || "";
      input.focus();
    });
  });

  const diseaseInput = document.getElementById("diseaseImageInput");
  if (diseaseInput) {
    diseaseInput.addEventListener("change", (event) => {
      showDiseasePreview(event.target.files?.[0]);
    });
  }
});
