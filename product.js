let selectedProduct = null
let charts = {}

/* ===============================
   MAHSULOTLARNI CHIQARISH
================================ */

async function renderProducts(){

try{

const res = await fetch("/products")
const products = await res.json()

const container = document.getElementById("products")

if(!container) return

container.innerHTML=""

products.forEach(p=>{

const card = document.createElement("div")
card.className="product-card"

card.innerHTML=`

<img src="${p.image}">
<h3>${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</h3>
<p>${p.price} so'm / ${p.unit}</p>

<div class="product-actions">
<button class="chart-btn">📈 Narx grafigi</button>
<button class="order-btn">Buyurtma berish</button>
</div>

<canvas id="chart-${p.id}" style="display:none;height:200px;"></canvas>

`

card.querySelector(".order-btn")
.addEventListener("click",()=>openOrder(p))

card.querySelector(".chart-btn")
.addEventListener("click",()=>toggleChart(p))

container.appendChild(card)

})

}catch(err){

console.error("Mahsulot yuklash xato:",err)

}

}

/* ===============================
   CARD ICHIDA GRAFIK
================================ */

async function toggleChart(product){

const canvas = document.getElementById(`chart-${product.id}`)

if(canvas.style.display==="none"){

canvas.style.display="block"

try{

/* REAL PRICE HISTORY */

const res = await fetch("/price-stats/" + product.name)
const data = await res.json()

/* AI PREDICTION */

const predRes = await fetch("/price-predict/" + product.name)
const predictions = await predRes.json()

if(!data.length) return

const labels = data.map(d=>d.date)
const prices = data.map(d=>d.price)

/* AI labels */

let futureLabels = []

for(let i=1;i<=predictions.length;i++){
futureLabels.push("AI+"+i)
}

const allLabels = [...labels, ...futureLabels]

/* DATASET */

const historyDataset = prices

const predictionDataset = new Array(prices.length-1).fill(null)
predictionDataset.push(prices[prices.length-1])
predictionDataset.push(...predictions)

/* OLD CHART DESTROY */

if(charts[product.id]){
charts[product.id].destroy()
}

charts[product.id] = new Chart(canvas,{

type:"line",

data:{
labels:allLabels,
datasets:[

{
label:"Real narx",
data:historyDataset,
borderColor:"#2e7d32",
backgroundColor:"rgba(46,125,50,0.2)",
borderWidth:3,
tension:0.3
},

{
label:"AI prognoz",
data:predictionDataset,
borderColor:"#ff9800",
borderDash:[6,6],
borderWidth:3,
tension:0.3
}

]
},

options:{
responsive:true,
plugins:{
legend:{
display:true
}
},
scales:{
y:{
beginAtZero:false,
suggestedMin: Math.min(...prices) - 1000,
suggestedMax: Math.max(...prices) + 2000
}
}
}

})

}catch(err){

console.error("Grafik xato:",err)

}

}else{

canvas.style.display="none"

}

}

/* ===============================
   BUYURTMA POPUP
================================ */

function openOrder(product){

selectedProduct = product
document.getElementById("popup").style.display="flex"

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