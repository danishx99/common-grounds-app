document.addEventListener("DOMContentLoaded", function () {
  var visitorCode = document.getElementById("visitorCode");
  var logout = document.getElementById("logout");
  var heading = document.getElementById("heading");
  var logo = document.getElementById("logo");
  var logIssue = document.getElementById("logIssue");

  var viewFines = document.getElementById("viewFines");

  let name = "";

  logIssue.addEventListener("click", function () {
    window.location.href = "/resident/manageIssues";
  });

  //url to view fines
  viewFines.addEventListener("click", function () {
    window.location.href = "/resident/viewFines";
  });

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

  logout.addEventListener("click", function () {
    //get request to /clear
    fetch("/clear")
      .then((res) => res.text())
      .then((data) => {
        console.log(data);
        window.location.href = "/";
      });
  });

  visitorCode.addEventListener("click", function () {
    window.location.href = "/resident/generateVisitorPassword";
  });

  logo.addEventListener("click", function () {
    window.location.href = "/resident";
  });
});
