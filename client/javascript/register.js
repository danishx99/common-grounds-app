document.addEventListener("DOMContentLoaded", function () {
  var submitButton = document.getElementById("submitButton");
  var proceedButton = document.getElementById("proceedButton");
  var form1 = document.getElementById("form-p1");
  var form2 = document.getElementById("form-p2");
  var back = document.getElementById("back");
  var registerWithGoogle = document.getElementById("register-with-google");

  let fname;
  let lname;
  let email;
  let password;
  let confirmPassword;
  let role;
  let code;

  proceedButton.addEventListener("click", function (event) {
    console.log("Proceed button clicked");

    var alert = document.getElementById("alert");
    alert.style.display = "none";

    // Validate form fields
    fname = document.getElementById("fname").value;
    lname = document.getElementById("lname").value;
    email = document.getElementById("email").value;
    password = document.getElementById("psw").value;
    confirmPassword = document.getElementById("psw-confirm").value;

    if (
      !fname ||
      !lname ||
      !email ||
      !password ||
      !confirmPassword ||
      fname === "" ||
      lname === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      alert.style.display = "block";
      alert.innerText = "Please fill in all fields";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    // Validate form fields
    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("psw").value;
    var confirmPassword = document.getElementById("psw-confirm").value;


    // Check if email meets requirements to be an email
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Please provide a valid email";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    
    // check that passwords match
    if (password !== confirmPassword) {
      alert.style.display = "block";
      alert.innerText = "Passwords do not match";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    // Check if password meets complexity requirements
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!PASSWORD_REGEX.test(password)) {
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText =
        "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    form1.className = "register-hide-form1";
    form2.className = "register-show-form2";
    back.style.display = "block";
    registerWithGoogle.style.display = "none";
    submitButton.style.display = "flex";
  });

  submitButton.addEventListener("click", function (event) {
    event.preventDefault();

    console.log("Submit button clicked");

    var alert = document.getElementById("alert");
    alert.style.display = "none";

    code = document.getElementById("code").value;

    if (!code || code === "") {
      alert.style.display = "block";
      alert.innerText = "Please fill in all fields";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    //show loader while waiting for response
    var loader = document.getElementById("loader");
    loader.style.display = "flex";

    // post request to register user
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: document.getElementById("fname").value,
        surname: document.getElementById("lname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("psw").value,
        confirmPassword: document.getElementById("psw-confirm").value,
        role: document.getElementById("acc-type").value,
        code: document.getElementById("code").value,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        //hide loader when response is received
        loader.style.display = "none";

        if (data.message === "User registered successfully") {
          //Show success message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = "User registered successfully";
          alert.className =
            "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

          //clear form fields
          document.getElementById("fname").value = "";
          document.getElementById("lname").value = "";
          document.getElementById("email").value = "";
          document.getElementById("psw").value = "";
          document.getElementById("psw-confirm").value = "";

          // redirect to login page
          setTimeout(() => {
            window.location.href = "/login";
          }, 5000);
        } else if (data.error) {
          //Show error message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = data.error;
          alert.className =
            "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
        }
      })
      .catch((error) => {
        console.log("Error:", error);
        loader.style.display = "none";
        alert("An error occurred. Please try again");
      });
  });

  back.addEventListener("click", function (event) {
    console.log("Back button clicked");
    form1.className = "register-show-form1";
    form2.className = "register-hide-form2";
    back.style.display = "none";
  });
});
