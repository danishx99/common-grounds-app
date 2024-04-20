var submitButton = document.getElementById("resetPasswordButton")

submitButton.addEventListener("click", function (event) {
  event.preventDefault()

  console.log("Reset Password button clicked")

  // Validate form fields
  var password = document.getElementById("psw").value
  var confirmPassword = document.getElementById("psw-confirm").value

  if (!password || password === "" || !confirmPassword ||confirmPassword === "") {
    var alert = document.getElementById("alert")
    alert.style.display = "block"
    alert.innerText = "Please fill in all fields"
    return
  }

  //show loader while waiting for response
  var loader = document.getElementById("loader")
  loader.style.display = "flex"

  //post request to reset password
  fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: document.getElementById("psw").value,
      confirmPassword: document.getElementById("psw-confirm").value,
    }),
  })
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log(data)
      //hide loader when response is received
      loader.style.display = "none"

      if (data.message ==="Password reset successfully") {
        //Show success message
        var alert = document.getElementById("alert")
        alert.style.display = "block"
        alert.innerText ="Password reset successfully, you can now login."

        //clear form fields
        document.getElementById("psw").value = ""
        document.getElementById("psw-confirm").value = ""
      } else if (data.error) {
        //Show error message
        var alert = document.getElementById("alert")
        alert.style.display = "block"
        alert.innerText = data.error
      }
    })
    .catch(error => {
      console.log("Error:", error)
      loader.style.display = "none"
      alert("An error occurred. Please try again")
    })
})

