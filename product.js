let selectedProduct = null;

/* ===============================
   MAHSULOTLARNI CHIQARISH
================================ */
function renderProducts() {

fetch("https://smart-dehqon.onrender.com/products")
.then(res => res.json())
.then(products => {

const container = document.getElementById("products");
container.innerHTML = "";

products.forEach(p => {
container.innerHTML += `
<div class="product-card">
<img src="${p.image}">
<h3>${p.name}</h3>
<p>${p.price} so'm / ${p.unit}</p>

<button onclick='openOrder(${JSON.stringify(p)})'>
Buyurtma berish
</button>
</div>
`;
});

});
}

/* ===============================
   NARX GRAFIK
================================ */
function loadChart(productName){

fetch(`https://smart-dehqon.onrender.com/price-stats/${productName}`)
.then(r=>r.json())
.then(data=>{

if(data.length === 0) return;

const labels = data.map(d=>d.date);
const prices = data.map(d=>d.price);

const ctx = document.getElementById("priceChart");

if(!ctx) return;

new Chart(ctx, {
type: "line",
data: {
labels: labels,
datasets: [{
label: "Narx o‘zgarishi",
data: prices,
borderWidth: 2
}]
}
});

});
}

/* ===============================
   BUYURTMA OCHISH
================================ */
function openOrder(product){

selectedProduct = product;

document.getElementById("popup").style.display = "flex";

// grafik yuklash
loadChart(product.name);
}

/* ===============================
   POPUP YOPISH
================================ */
function closePopup(){
document.getElementById("popup").style.display = "none";
document.getElementById("phoneInput").value = "";
}

/* ===============================
   BUYURTMA YUBORISH
================================ */
function submitOrder(){

const phone = document.getElementById("phoneInput").value.trim();

if(!phone){
alert("Telefon kiriting");
return;
}

const data = {
product: selectedProduct.name,
price: selectedProduct.price,
phone: phone
};

fetch("https://smart-dehqon.onrender.com/send-order",  {
method: "POST",
headers: {"Content-Type": "application/json"},
body: JSON.stringify(data)
})
.then(res => res.json())
.then(() => {
alert("Buyurtma yuborildi");
closePopup();
});
}

document.addEventListener("DOMContentLoaded", renderProducts);