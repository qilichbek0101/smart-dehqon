function login(){

const user = document.getElementById("username").value
const pass = document.getElementById("password").value

if(user === "admin" && pass === "1234"){

localStorage.setItem("admin", "true")

window.location = "admin.html"

}else{

alert("Login yoki parol xato")

}

}