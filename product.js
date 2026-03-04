let selectedProduct = null
let priceChart = null


/* ===============================
   MAHSULOTLARNI CHIQARISH
================================ */

async function renderProducts(){

try{

const res = await fetch("/products")
const products = await res.json()

const container = document.getElementById("products")

container.innerHTML=""

products.forEach(p=>{

const card = document.createElement("div")
card.className="product-card"

card.innerHTML=`
<img src="${p.image}">
<h3>${p.name}</h3>
<p>${p.price} so'm / ${p.unit}</p>
<button class="order-btn">Buyurtma berish</button>
`

card.querySelector(".order-btn")
.addEventListener("click",()=>openOrder(p))

container.appendChild(card)

})

}catch(err){

console.error("Mahsulot yuklash xato:",err)

}

}



/* ===============================
   GRAFIK YUKLASH
================================ */

async function loadChart(productName){

try{

const res = await fetch("/price-stats/" + productName)
const data = await res.json()

if(!data.length) return

const labels = data.map(d=>d.date)
const prices = data.map(d=>d.price)

const ctx = document.getElementById("priceChart")

if(priceChart){
priceChart.destroy()
}

priceChart = new Chart(ctx,{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Narx o'zgarishi",
data:prices,
borderColor:"#2e7d32",
backgroundColor:"rgba(46,125,50,0.2)",
borderWidth:3,
tension:0.3
}]
},

options:{
responsive:true,
scales:{
y:{
beginAtZero:false
}
}
}

})

}catch(err){

console.error("Grafik xato:",err)

}

}



/* ===============================
   BUYURTMA POPUP
================================ */

function openOrder(product){

selectedProduct = product

document.getElementById("popup").style.display="flex"

loadChart(product.name)

}



/* ===============================
   POPUP YOPISH
================================ */

function closePopup(){

document.getElementById("popup").style.display="none"

document.getElementById("phoneInput").value=""

}



/* ===============================
   BUYURTMA YUBORISH
================================ */

async function submitOrder(){

const phone = document.getElementById("phoneInput").value.trim()

if(!phone){
alert("Telefon kiriting")
return
}

const data={
product:selectedProduct.name,
price:selectedProduct.price,
phone:phone
}

try{

const res = await fetch("/send-order",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

})

const result = await res.json()

if(result.status==="ok"){
alert("Buyurtma yuborildi")
closePopup()
}

}catch(err){

console.error("Buyurtma xato:",err)

}

}



/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded",renderProducts)