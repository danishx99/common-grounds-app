document.addEventListener("DOMContentLoaded", function () {
  var logout = document.getElementById("logout");
  var logo = document.getElementById("logo");
  const manageIssues = document.getElementById("manageIssues");
  var heading = document.getElementById("heading");

  //get request to /api/users/getCurrentUser
  fetch("/api/users/getCurrentUser")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data.user);
      name = data.user[0].name;
      heading.innerText = `Welcome to your resident dashboard, ${name}!`;
    })
    .catch((error) => {
      console.log("Error:", error);
    });

  manageIssues.addEventListener("click", function () {
    window.location.href = "/staff/manageIssues";
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

  logo.addEventListener("click", function () {
    window.location.href = "/staff";
  });
});
