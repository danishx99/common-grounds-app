var submitButton = document.getElementById("requestResetLinkButton");

submitButton.addEventListener("click", function (event) {
  event.preventDefault();

  console.log("Request Reset Link button clicked");

  // Validate form fields
  var email = document.getElementById("email").value;

  if (!email || email === "") {
    var alert = document.getElementById("alert");
    alert.style.display = "block";
    alert.innerText = "Please fill in required field";
    alert.className =
      "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
    return;
  }

  //show loader while waiting for response
  var loader = document.getElementById("loader");
  loader.style.display = "flex";

  //post request to request reset link
  fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: document.getElementById("email").value,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      //hide loader when response is received
      loader.style.display = "none";

      if (
        data.message ===
        "Password reset instructions have been sent to your email"
      ) {
        //Show success message
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText =
          "Password reset instructions have been sent to your email, please check your email.";
        alert.className =
          "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

        // close tab
        setTimeout(() => {
          window.close();
        }, 5000);

        //clear form fields
        document.getElementById("email").value = "";
      } else if (data.error) {
        //Show error message
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = data.error;
      }
    })
    .catch((error) => {
      console.log("Error:", error);
      loader.style.display = "none";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
    });
});
