


//////////////////////////////optimal cod

/* =========================
   LOCAL STORAGE HELPERS
========================= */

// ======================
// ADMIN LOGIN CHECK
// ======================

if(localStorage.getItem("admin") !== "true"){
  
  window.location = "login.html"
}
if(localStorage.getItem("role") !== "farmer"){
  alert("Faqat fermerlar uchun")
  window.location = "index.html"
}

function logout(){
  localStorage.clear()
  window.location = "login.html"
}


// ======================
// MAHSULOT QO‘SHISH
// ======================

function addProduct(){

  const name  = document.getElementById("name").value.trim()
  const price = document.getElementById("price").value.trim()
  const unit  = document.getElementById("unit").value
  const file  = document.getElementById("imageInput").files[0]

  if(!name || !price || !file){
    alert("Ma'lumotlarni to‘liq kiriting")
    return
  }

  const formData = new FormData()
  formData.append("name", name)
  formData.append("price", price)
  formData.append("unit", unit)
  formData.append("image", file)

  fetch("/add-product",{
    method:"POST",
    body:formData
  })
  .then(res=>res.json())
  .then(data=>{

    if(data.status==="ok"){
      alert("Mahsulot qo‘shildi")
      renderAdminProducts()
    }

  })
}


// ======================
// MAHSULOTLARNI OLISH
// ======================

function renderAdminProducts(){

fetch("/products")
.then(res=>res.json())
.then(products=>{

const box = document.getElementById("adminProducts")
if(!box) return

box.innerHTML=""

products.reverse().forEach(p=>{

box.innerHTML += `

<div class="admin-product">

<img src="${p.image}" class="admin-img">

<div class="admin-info">
<h3>${p.name}</h3>
<p>${p.price} so'm / ${p.unit}</p>
</div>

<div class="admin-actions">

<button onclick="editProduct(${p.id},'${p.name}',${p.price},'${p.unit}')"
class="edit-btn">
Edit
</button>

<button onclick="deleteProduct(${p.id})"
class="delete-btn">
Delete
</button>

</div>

</div>

`

})

})

}


// ======================
// MAHSULOT DELETE
// ======================

function deleteProduct(id){

if(!confirm("Mahsulotni o‘chirmoqchimisiz?")) return

fetch("/delete-product/"+id,{
method:"DELETE"
})
.then(res=>res.json())
.then(data=>{

if(data.status==="deleted"){
alert("Mahsulot o‘chirildi")
renderAdminProducts()
}

})
.catch(err=>{
console.log("Delete error:",err)
})

}


// ======================
// MAHSULOT EDIT
// ======================

function editProduct(id,name,price,unit){

const newName = prompt("Mahsulot nomi:",name)
const newPrice = prompt("Narx:",price)
const newUnit = prompt("Unit:",unit)

if(!newName || !newPrice) return

fetch("/update-product/"+id,{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
name:newName,
price:newPrice,
unit:newUnit
})

})
.then(res=>res.json())
.then(()=>{

alert("Mahsulot yangilandi")
renderAdminProducts()

})

}


// ======================
// BUYURTMALAR
// ======================

function renderOrders(){

fetch("/orders")
.then(res=>res.json())
.then(orders=>{

const container = document.getElementById("ordersTable")
if(!container) return

container.innerHTML=""

orders.reverse().forEach(o=>{

container.innerHTML += `

<tr>

<td>${o.product}</td>

<td>${o.price} so'm</td>

<td>${o.phone}</td>

<td>${o.created_at}</td>

<td>
<a href="tel:${o.phone}">
<button class="call-btn">Qo'ng'iroq</button>
</a>
</td>

</tr>

`

})

})

}


// ======================
// STATISTIKA
// ======================

function loadStats(){

fetch("/orders")
.then(res=>res.json())
.then(data=>{

document.getElementById("totalOrders").innerText = data.length

let today = 0
let revenue = 0

const todayDate = new Date().toISOString().slice(0,10)

data.forEach(o=>{

revenue += Number(o.price)

if(o.created_at.startsWith(todayDate)){
today++
}

})

document.getElementById("todayOrders").innerText = today
document.getElementById("totalRevenue").innerText = revenue

})

}


// ======================
// INIT
// ======================

document.addEventListener("DOMContentLoaded",function(){

renderAdminProducts()
renderOrders()
loadStats()

loadTopProducts()
loadCropRecommendation()

})

/* =========================
   AI TOP PRODUCTS
========================= */

async function loadTopProducts(){

try{

const res = await fetch("/top-products")
const data = await res.json()

const box = document.getElementById("topProducts")
if(!box) return

box.innerHTML=""

// 🔥 DEMAND LOGIKA
const max = Math.max(...data.map(i => i.orders))

data.forEach(i => {
  const ratio = i.orders / max

  if(ratio >= 0.8){
    i.demand = "high"
  }
  else if(ratio >= 0.5){
    i.demand = "medium"
  }
  else{
    i.demand = "low"
  }
})

// 🔥 UI
data.slice(0,5).forEach(p=>{

let icon = ""
let label = ""

if(p.demand === "high"){
  icon = "🔥"
  label = "Yuqori talab"
}
else if(p.demand === "medium"){
  icon = "⚖️"
  label = "O‘rtacha"
}
else{
  icon = "❄️"
  label = "Past talab"
}

box.innerHTML += `
<li>${icon} ${p.product} — ${label} (${p.orders})</li>
`

})

}catch(err){
console.log(err)
}

}


/* =========================
   AI CROP RECOMMENDATION
========================= */

async function loadCropRecommendation(){

try{

const res = await fetch("/crop-recommendation")
const data = await res.json()

const box = document.getElementById("cropRecommend")

if(!box) return

box.innerHTML=""

data.slice(0,5).forEach(p=>{

box.innerHTML += `
<li>${p[0]}</li>
`

})

}catch(err){
console.log(err)
}

}