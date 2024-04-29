document.addEventListener("DOMContentLoaded", function () {
  var generateCode = document.getElementById("generateCode");
  var manageUsers = document.getElementById("manageUsers");
  var manageVistors = document.getElementById("manageVisitors");
  var logout = document.getElementById("logout");
  var heading = document.getElementById("heading");
  var logo = document.getElementById("logo");

  let name = "";

  //get request to /api/users/getCurrentUser
  fetch("/api/users/getCurrentUser")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data.user);
      name = data.user[0].name;
      heading.innerText = `Welcome to your staff dashboard, ${name}!`;
    })
    .catch((error) => {
      console.log("Error:", error);
    });

  logout.addEventListener("click", function () {
    //get request to /clear
    fetch("/clear")
      .then((res) => res.text())
      .then((data) => {
        console.log(data);
        window.location.href = "/";
      });
  });

  generateCode.addEventListener("click", function () {});

  manageUsers.addEventListener("click", function () {});

  manageVistors.addEventListener("click", function () {});

  logo.addEventListener("click", function () {
    window.location.href = "/staff";
  });
});
