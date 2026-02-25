let selectedProduct = null;

// 🔴 DBdan mahsulot olish
function renderProducts() {
  fetch("/products")
    .then(res => res.json())
    .then(products => {

      const container = document.getElementById("products");
      container.innerHTML = "";

      products.forEach(p => {
        container.innerHTML += `
          <div class="card">
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

function openOrder(product){
  selectedProduct = product;
  document.getElementById("popup").style.display = "flex";
}

function closePopup(){
  document.getElementById("popup").style.display = "none";
  document.getElementById("phoneInput").value = "";
}

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

  fetch("/send-order", {
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