document.addEventListener("DOMContentLoaded", function () {
  var checkInButton = document.getElementById("proceedButton");
  var logout = document.getElementById("logout");
  var logo = document.getElementById("logo");
  const back = document.getElementById("back");

  back.addEventListener("click", function () {
    window.location.href = "/admin/manageVisitors";
  });

  logo.addEventListener("click", function () {
    window.location.href = "/";
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

  checkInButton.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Check in Visitor button clicked");

    //show loader while waiting for response
    var loader = document.getElementById("loader");
    loader.style.display = "flex";

    // Validate form fields
    var name = document.getElementById("fname").value;
    var surname = document.getElementById("lname").value;
    var cellnum = document.getElementById("cellnum").value;
    var id = document.getElementById("id").value;
    var password = document.getElementById("password").value;
    console.log(name, surname, cellnum, id, password);

    if (!name || !surname || !cellnum || !id || !password) {
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Please fill in all fields";
      loader.style.display = "none";
      return;
    }

    console.log(name, surname, cellnum, id, password);

    // post request to generate code
    fetch("/api/visitors/checkInVisitor", {
      method: "POST",
      body: JSON.stringify({
        fname: document.getElementById("fname").value,
        lname: document.getElementById("lname").value,
        cellnum: document.getElementById("cellnum").value,
        id: document.getElementById("id").value,
        password: document.getElementById("password").value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);

        //hide loader when response is received
        loader.style.display = "none";

        if (data.error) {
          //Show error message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = data.error;
          alert.className =
            "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
        } else if (data.message) {
          //Show success message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = "Visitor signed in successfully. Redirecting...";
          alert.className =
            "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      })
      .catch((error) => {
        console.log("Error:", error);
        loader.style.display = "none";
      });
  });
});
