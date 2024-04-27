var submitButton = document.getElementById("submitButton");

submitButton.addEventListener("click", function (event) {
  event.preventDefault();

  console.log("Submit button clicked");

  // Validate form fields
  var email = document.getElementById("email").value;
  var password = document.getElementById("psw").value;

  if (!email || !password) {
    var alert = document.getElementById("alert");
    alert.style.display = "block";
    alert.innerText = "Please fill in all fields";
    return;
  }

  //show loader while waiting for response
  var loader = document.getElementById("loader");
  loader.style.display = "flex";

  //post request to login user
  fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("psw").value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      //console.log(data);
      //hide loader when response is received
      loader.style.display = "none";

      if (data.error) {
        //Show error message
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = data.error;
        alert.className =
          "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      } else if (data.success) {
        //Show success login message
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = "Login successful. Redirecting...";
        alert.className =
          "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

        //Check for data.redirect and redirect
        if (data.redirect) {
          setTimeout(() => {
            window.location.href = data.redirect.toLowerCase();
          }, 3000);
        }
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      loader.style.display = "none";
      alert("An error occurred. Please try again");
    });
});

var cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", function (event) {
  // redirect to facialAuth page
  setTimeout(() => {
    window.location.href = '/facialAuth';
    }, 0);

});