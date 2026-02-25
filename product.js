// ///////////optimal cod////////

/* =========================
   LOCAL STORAGE HELPERS
========================= */

function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

function getOrders(){
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(data){
  localStorage.setItem("orders", JSON.stringify(data));
}


/* =========================
   MAHSULOTLARNI CHIQARISH
========================= */

let selectedProduct = null;

// MAHSULOTLARNI CHIQARISH
function renderProducts() {
  const container = document.getElementById("products");
  const products = JSON.parse(localStorage.getItem("products")) || [];

  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.price}</p>

        <button onclick='openOrder(${JSON.stringify(p)})'>
          Buyurtma berish
        </button>
      </div>
    `;
  });
}

// POPUP OCHISH
function openOrder(product){
  selectedProduct = product;
  document.getElementById("popup").style.display = "flex";
}

// POPUP YOPISH
function closePopup(){
  document.getElementById("popup").style.display = "none";
  document.getElementById("phoneInput").value = "";
}

// BUYURTMA YUBORISH
function submitOrder(){
  const phone = document.getElementById("phoneInput").value.trim();

  if(!phone){
    alert("Telefon kiriting");
    return;
  }

  if(!selectedProduct){
    alert("Mahsulot topilmadi");
    return;
  }

  const data = {
    product: selectedProduct.name,
    price: selectedProduct.price,
    phone: phone
  };

  fetch("/send-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    alert("Buyurtma yuborildi");
    closePopup();
  })
  .catch(err => {
    console.error(err);
    alert("Server xatosi");
  });
}

document.addEventListener("DOMContentLoaded", renderProducts);

/* =========================
   POPUP YOPISH
========================= */




/* =========================
   BUYURTMA YUBORISH
========================= */




function submitOrder() {
  const phoneInput = document.getElementById("phoneInput");
  const phone = phoneInput.value.trim();

  if (!phone) {
    alert("Telefon kiriting");
    return;
  }

  if (!window.currentProduct) {
    alert("Mahsulot topilmadi");
    return;
  }

  const data = {
    product: window.currentProduct.name,
    price: window.currentProduct.price,
    phone: phone
  };

  fetch("/send-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    alert("Buyurtma yuborildi");
    closePopup();
  })
  .catch(() => {
    alert("Server xatosi");
  });
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});