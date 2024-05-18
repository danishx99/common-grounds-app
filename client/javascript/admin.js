document.addEventListener("DOMContentLoaded", function () {
  var generateCode = document.getElementById("generateCode");
  var manageUsers = document.getElementById("manageUsers");
  var manageVistors = document.getElementById("manageVisitors");
  var logout = document.getElementById("logout");
  var heading = document.getElementById("heading");
  var logo = document.getElementById("logo");
  var manageFines = document.getElementById("manageFines");
  var sendNotification = document.getElementById("sendNotification");

  let name = "";

  //get request to /api/users/getCurrentUser
  fetch("/api/users/getCurrentUser")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data.user);
      name = data.user[0].name;
      heading.innerText = `Welcome to your admin dashboard, ${name}!`;
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

  sendNotification.addEventListener("click", function () {
    window.location.href = "/admin/sendNotification";
  });

  manageFines.addEventListener("click", function () {
    window.location.href = "/admin/manageFines";
  });

  generateCode.addEventListener("click", function () {
    window.location.href = "/admin/generateCode";
  });

  manageUsers.addEventListener("click", function () {
    window.location.href = "/admin/manageUsers";
  });

  manageVistors.addEventListener("click", function () {
    window.location.href = "/admin/manageVisitors";
  });

  logo.addEventListener("click", function () {
    window.location.href = "/admin";
  });
});
