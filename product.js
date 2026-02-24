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

function submitOrder(){

  const phoneEl = document.getElementById("phoneInput");
  if(!phoneEl) return;

  const phone = phoneEl.value.trim();

  if(phone.length < 9){
    phoneEl.classList.add("error");
    phoneEl.focus();
    return;
  }

  phoneEl.classList.remove("error");

  const order = {
    id: Date.now(),
    phone: phone,
    product: window.currentProduct?.name || "",
    price: window.currentProduct?.price || "",
    date: new Date().toLocaleString()
  };

  // LOCAL SAQLASH
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  // TELEGRAMGA YUBORISH
 fetch("https://smart-dehqon.onrender.com/send-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
  .then(res => console.log("Server:", res.status))
  .catch(err => console.error("Fetch error:", err));

  // UI SUCCESS
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");

  if(form) form.style.display = "none";
  if(success) success.style.display = "block";
}


/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});