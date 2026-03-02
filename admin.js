// /* SCROLL */
// function safe(id){
//   return document.getElementById(id);
// }
// function scrollToProducts() {
//   const container = document.getElementById("products");
//   if(section){
//     section.scrollIntoView({ behavior: "smooth" });
//   }
// }

// /* POPUP YOPISH */


// /* BUYURTMA TUGMASI */
// document.addEventListener("click", function(e){

//   if(e.target.classList.contains("order-btn")){

//     const card = e.target.closest(".card");

//     const name = card.querySelector("h3").innerText;
//     const price = card.querySelector("p").innerText;

//     // MUHIM: mahsulotni saqlaymiz
//     window.currentProduct = {
//       name: name,
//       price: price
//     };

//     const popup = document.getElementById("popup");
//     if(popup){
//       popup.style.display = "flex";
//     }

//   }

// });

// /* ADMIN PANEL – MAHSULOT QO‘SHISH */
// function addProduct(){

//   const name = document.getElementById("name").value.trim();
//   const price = document.getElementById("price").value.trim();
//   const unit = document.getElementById("unit").value;
//   const file = document.getElementById("imageInput").files[0];

//   if(!name || !price || !unit){
//     alert("Ma'lumotlarni to‘liq kiriting");
//     return;
//   }

//   if(!file){
//     alert("Rasm tanlang");
//     return;
//   }

//   const reader = new FileReader();

//   reader.onload = function(e){

//     let products = JSON.parse(localStorage.getItem("products")) || [];

//     const product = {
//       id: Date.now(),
//       name,
//       price,
//       unit,
//       image: e.target.result
//     };

//     products.push(product);
//     localStorage.setItem("products", JSON.stringify(products));

//     alert("Mahsulot qo‘shildi");
//     renderAdminProducts();

//     // form tozalash
//     document.getElementById("name").value = "";
//     document.getElementById("price").value = "";
//     document.getElementById("imageInput").value = "";
//   }

//   reader.readAsDataURL(file);
// }

// /* PRODUCTS SAHIFA – CHIQARISH */
// function showProducts(){

//   const container = document.getElementById("products");
//   if(!container) return; // faqat products.html da ishlaydi

//   let products = JSON.parse(localStorage.getItem("products")) || [];

//   container.innerHTML = "";

//   products.forEach(p=>{
//   container.innerHTML += `
//     <div class="card">
//       <img src="${p.image}">
//       <h3>${p.name}</h3>
//       <p>${p.price} so'm / ${p.unit}</p>

//       <button class="order-btn">Buyurtma berish</button>

//       <a href="https://t.me/smartdehqon" target="_blank" class="tg-btn">
//         Telegram yozish
//       </a>
//     </div>
//   `;

// });
  
// }

// showProducts();

// /* BUYURTMA YUBORISH */
// console.log("BUYURTMA BOSILDI");


// /* POPUP YOPISH */






// function toggleOrders(){

//   const section = document.getElementById("ordersSection");

//   if(section.style.display === "none"){
//     section.style.display = "block";
//     showOrders(); // buyurtmalarni chiqar
//     section.scrollIntoView({behavior:"smooth"});
//   }else{
//     section.style.display = "none";
//   }

// }
// function showAdd(){
//   document.getElementById("addSection").style.display="block";
//   document.getElementById("ordersSection").style.display="none";
// }

// function showOrders(){
//   const add = document.getElementById("addSection");
//   const orders = document.getElementById("ordersSection");

//   if(add) add.style.display="none";
//   if(orders) orders.style.display="block";

//   renderOrders();
// }


// function renderOrders(){

//   const container = document.getElementById("ordersList");
//   if(!container) return;

//   let orders = JSON.parse(localStorage.getItem("orders")) || [];

//   container.innerHTML="";

//   orders.reverse().forEach(o=>{
//     container.innerHTML += `
//       <div class="order-card">
//         <b>${o.product}</b><br>
//         ${o.price}<br>
//         📞 ${o.phone}<br>
//         <small>${o.date}</small>
//       </div>
//     `;
//   });
// }
// function openOrders(){

//   const panel = document.getElementById("ordersPanel");

//   if(panel.style.display === "block"){
//     panel.style.display = "none";
//   }else{
//     panel.style.display = "block";
//     renderOrders();
//   }

// }

// function renderOrders(){

//   const container = document.getElementById("ordersList");
//   if(!container) return;

//   let orders = JSON.parse(localStorage.getItem("orders")) || [];
//   container.innerHTML="";

//   orders.reverse().forEach(o=>{

//     const doneText = o.status === "done"
//       ? "<span style='color:green'>✔ Qabul qilindi</span>"
//       : "";

//     container.innerHTML += `
//       <div class="order-item">

//         <b>${o.product}</b><br>
//         ${o.price}<br>
//         📞 ${o.phone}<br>
//         <small>${o.date}</small><br>
//         ${doneText}

//         <div style="margin-top:8px; display:flex; gap:8px;">
//           <a href="tel:${o.phone}" class="call-btn">Qo‘ng‘iroq</a>
//           <button onclick="markDone(${o.id})" class="done-btn">Qabul qilindi</button>
//           <button onclick="deleteOrder(${o.id})" class="del-btn">O‘chirish</button>
//         </div>

//       </div>
//     `;
//   });

// }
// function deleteOrder(id){

//   let orders = JSON.parse(localStorage.getItem("orders")) || [];
//   orders = orders.filter(o=>o.id !== id);

//   localStorage.setItem("orders", JSON.stringify(orders));
//   renderOrders();
// }
// function openOrders(){
//   document.getElementById("ordersModal").style.display="flex";
//   renderOrders();
// }

// function closeOrders(){
//   document.getElementById("ordersModal").style.display="none";
// }

// function deleteOrder(id){

//   let orders = JSON.parse(localStorage.getItem("orders")) || [];
//   orders = orders.filter(o=>o.id !== id);

//   localStorage.setItem("orders", JSON.stringify(orders));
//   renderOrders();
// }

// function markDone(id){

//   let orders = JSON.parse(localStorage.getItem("orders")) || [];

//   orders = orders.map(o=>{
//     if(o.id === id){
//       o.status = "done";
//     }
//     return o;
//   });

//   localStorage.setItem("orders", JSON.stringify(orders));
//   renderOrders();
// }

// function markDone(id){

//   let orders = JSON.parse(localStorage.getItem("orders")) || [];

//   orders = orders.map(o=>{
//     if(o.id === id){
//       o.status = "done";
//     }
//     return o;
//   });

//   localStorage.setItem("orders", JSON.stringify(orders));
//   renderOrders();
// }

// function scrollWhy(){
//   const section = document.querySelector(".why");
//   if(section){
//     section.scrollIntoView({behavior:"smooth"});
//   }
// }
// document.querySelector('#why')

// function renderAdminProducts(){

//   const box = document.getElementById("adminProducts");
//   if(!box) return;

//   let products = JSON.parse(localStorage.getItem("products")) || [];

//   box.innerHTML = "";

//   products.reverse().forEach(p => {

//     box.innerHTML += `
//       <div style="
//         background:white;
//         padding:10px;
//         margin:10px 0;
//         border-radius:10px;
//         display:flex;
//         align-items:center;
//         gap:10px;
//       ">
//         <img src="${p.image}" width="60" height="60" style="object-fit:cover;border-radius:8px;">
        
//         <div style="flex:1">
//           <b>${p.name}</b><br>
//           ${p.price} so'm / ${p.unit}
//         </div>

//         <button onclick="deleteProduct(${p.id})" 
//         style="background:red;color:white;border:none;padding:6px 10px;border-radius:6px;">
//           O‘chirish
//         </button>
//       </div>
//     `;
//   });
// }

// function deleteProduct(id){

//   let products = JSON.parse(localStorage.getItem("products")) || [];
//   products = products.filter(p => p.id !== id);

//   localStorage.setItem("products", JSON.stringify(products));
//   renderAdminProducts();
// }
// document.addEventListener("DOMContentLoaded", () => {
//   renderAdminProducts();
// });



//////////////////////////////optimal cod

/* =========================
   LOCAL STORAGE HELPERS
========================= */

function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}
function saveProducts(data){
  localStorage.setItem("products", JSON.stringify(data));
}

function getOrders(){
  return JSON.parse(localStorage.getItem("orders")) || [];
}
function saveOrders(data){
  localStorage.setItem("orders", JSON.stringify(data));
}


/* =========================
   MAHSULOT QO‘SHISH
========================= */

function addProduct(){

  const nameInput  = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const unitInput  = document.getElementById("unit");
  const fileInput  = document.getElementById("imageInput");

  if(!nameInput || !priceInput || !unitInput || !fileInput) return;

  const name  = nameInput.value.trim();
  const price = priceInput.value.trim();
  const unit  = unitInput.value;
  const file  = fileInput.files[0];

  if(!name || !price){
    alert("Ma'lumotlarni to‘liq kiriting");
    return;
  }

  if(!file){
    alert("Rasm tanlang");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){

    const products = getProducts();

    const product = {
      id: Date.now(),
      name,
      price,
      unit,
      image: e.target.result
    };

    products.push(product);
    saveProducts(products);

    alert("Mahsulot qo‘shildi");

    renderAdminProducts();

    nameInput.value = "";
    priceInput.value = "";
    fileInput.value = "";
  }

  reader.readAsDataURL(file);
}


/* =========================
   ADMIN MAHSULOTLAR RO‘YXATI
========================= */

function renderAdminProducts(){

  const box = document.getElementById("adminProducts");
  if(!box) return;

  const products = getProducts();

  box.innerHTML = "";

  products.reverse().forEach(p => {

    box.innerHTML += `
      <div style="
        background:white;
        padding:10px;
        margin:10px 0;
        border-radius:10px;
        display:flex;
        align-items:center;
        gap:10px;
      ">
        <img src="${p.image}" width="60" height="60"
             style="object-fit:cover;border-radius:8px;">
        
        <div style="flex:1">
          <b>${p.name}</b><br>
          ${p.price} so'm / ${p.unit}
        </div>

        <button onclick="deleteProduct(${p.id})"
          style="background:red;color:white;border:none;
          padding:6px 10px;border-radius:6px;">
          O‘chirish
        </button>
      </div>
    `;
  });
}

function deleteProduct(id){

  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);

  renderAdminProducts();
}


/* =========================
   ORDER PANEL
========================= */

function showAdd(){
  const add = document.getElementById("addSection");
  const orders = document.getElementById("ordersSection");

  if(add) add.style.display = "block";
  if(orders) orders.style.display = "none";
}

function showOrders(){
  const add = document.getElementById("addSection");
  const orders = document.getElementById("ordersSection");

  if(add) add.style.display = "none";
  if(orders) orders.style.display = "block";

  renderOrders();
}


/* =========================
   ORDER RENDER
========================= */

function renderOrders(){

  const container = document.getElementById("ordersList");
  if(!container) return;

  const orders = getOrders();

  container.innerHTML = "";

  orders.slice().reverse().forEach(o => {

    const doneText = o.status === "done"
      ? "<span style='color:green'>✔ Qabul qilindi</span>"
      : "";

    container.innerHTML += `
      <div class="order-item">

        <b>${o.product}</b><br>
        ${o.price}<br>
        📞 ${o.phone}<br>
        <small>${o.date}</small><br>
        ${doneText}

        <div style="margin-top:8px;display:flex;gap:8px;">
          <a href="tel:${o.phone}" class="call-btn">Qo‘ng‘iroq</a>

          <button onclick="markDone(${o.id})"
            class="done-btn">Qabul qilindi</button>

          <button onclick="deleteOrder(${o.id})"
            class="del-btn">O‘chirish</button>
        </div>

      </div>
    `;
  });
}


/* =========================
   ORDER ACTIONS
========================= */

function deleteOrder(id){

  let orders = getOrders();
  orders = orders.filter(o => o.id !== id);
  saveOrders(orders);

  renderOrders();
}

function markDone(id){

  let orders = getOrders();

  orders = orders.map(o=>{
    if(o.id === id){
      o.status = "done";
    }
    return o;
  });

  saveOrders(orders);
  renderOrders();
}


/* =========================
   MODAL
========================= */

function openOrders(){
  const modal = document.getElementById("ordersModal");
  if(modal){
    modal.style.display = "flex";
    renderOrders();
  }
}

function closeOrders(){
  const modal = document.getElementById("ordersModal");
  if(modal){
    modal.style.display = "none";
  }
}


/* =========================
   INIT
========================= */

function addProduct(){

const name = document.getElementById("name").value
const price = document.getElementById("price").value
const unit = document.getElementById("unit").value
const image = document.getElementById("imageInput").value

fetch("https://smart-dehqon.onrender.com/add-product",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name:name,
price:price,
unit:unit,
image:image
})

})
.then(res=>res.json())
.then(data=>{

alert("Mahsulot qo'shildi")

location.reload()

})

}