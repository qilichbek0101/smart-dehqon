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

function renderProducts(){

  const container = document.getElementById("products");
  if(!container) return;

  const products = getProducts();
  container.innerHTML = "";

  products.forEach(p => {

    container.innerHTML += `
      <div class="card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.price} so'm / ${p.unit}</p>

        <button class="order-btn">Buyurtma berish</button>

        <a href="https://t.me/smartdehqon"
           target="_blank"
           class="tg-btn">
           Telegram yozish
        </a>
      </div>
    `;
  });
}


/* =========================
   BUYURTMA BOSILDI
========================= */

document.addEventListener("click", function(e){

  if(e.target.classList.contains("order-btn")){

    const card = e.target.closest(".card");
    if(!card) return;

    const name  = card.querySelector("h3").innerText;
    const price = card.querySelector("p").innerText;

    window.currentProduct = { name, price };

    const popup = document.getElementById("popup");
    if(popup){
      popup.style.display = "flex";
    }
  }

});


/* =========================
   POPUP YOPISH
========================= */

function closePopup(){

  const popup = document.getElementById("popup");
  if(!popup) return;

  popup.style.display = "none";

  const phoneInput = document.getElementById("phoneInput");
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");

  if(phoneInput){
    phoneInput.value = "";
    phoneInput.classList.remove("error");
  }

  if(form) form.style.display = "block";
  if(success) success.style.display = "none";
}


/* =========================
   BUYURTMA YUBORISH
========================= */

let selectedProduct = null;

function openOrderModal(product) {
  selectedProduct = product;
  document.getElementById("orderModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("orderModal").style.display = "none";
}

function submitOrder() {
  const phoneInput = document.getElementById("phone");
  const phone = phoneInput.value.trim();

  if (!phone) {
    alert("Telefon kiriting");
    return;
  }

  if (!selectedProduct) {
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
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    alert("Buyurtma yuborildi");
    closeModal();
    phoneInput.value = "";
  })
  .catch(err => {
    console.error(err);
    alert("Server xatosi");
  });
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});