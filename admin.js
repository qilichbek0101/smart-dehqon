


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

function logout(){
  localStorage.removeItem("admin")
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

const container = document.getElementById("ordersList")
if(!container) return

container.innerHTML=""

orders.reverse().forEach(o=>{

container.innerHTML += `

<div class="order-item">

<b>${o.product}</b><br>
${o.price} so'm<br>
📞 ${o.phone}<br>
<small>${o.created_at}</small>

<div style="margin-top:8px;">
<a href="tel:${o.phone}" class="call-btn">
Qo‘ng‘iroq
</a>
</div>

</div>

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

})