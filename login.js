function login(){

const role = document.querySelector('input[name="role"]:checked').value
const user = document.getElementById("username").value
const pass = document.getElementById("password").value

// 🛒 BUYER → login shart emas
if(role === "buyer"){
  localStorage.setItem("role", "buyer")
  window.location = "products.html"
  return
}

// 🧑‍🌾 FARMER → login shart
if(role === "farmer"){

  if(user === "admin" && pass === "1234"){
    localStorage.setItem("role", "farmer")
    localStorage.setItem("admin", "true")
    window.location = "admin.html"
  }else{
    alert("Login yoki parol xato")
  }

}

}