document.addEventListener("DOMContentLoaded", function () {
  var searchButton = document.getElementById("searchButton");
  var submitFineButton = document.getElementById("submitFineButton");
  const logo = document.getElementById("logo");
  const logout = document.getElementById("logout");
  const back = document.getElementById("back");

  back.addEventListener("click", function () {
    window.location.href = "/admin/manageFines";
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

  var textArea = document.getElementById("description");
  const charCount = document.getElementById("char-count");

  // Update character count on input
  textArea.addEventListener("input", () => {
    const charactersLeft = 250 - textArea.value.length;
    charCount.textContent = `${charactersLeft} characters remaining`;

    // Optional: Disable submit button or show warning if exceeding limit
    if (charactersLeft < 0) {
      // Add logic to disable submit button or display a warning message
      charCount.style.color = "red";
      charCount.textContent = "Word limit exceeded!";
      submitFineButton.disabled = true;
    } else {
      charCount.style.color = "black";
      submitFineButton.disabled = false;
    }
  });

  searchButton.addEventListener("click", function (event) {
    event.preventDefault();

    var alert = document.getElementById("alert");
    var loader = document.getElementById("loader");
    const fname = document.getElementById("fname");
    const lname = document.getElementById("lname");
    const email = document.getElementById("email");

    const userCode = document.getElementById("userCode").value;

    if (!userCode) {
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Please fill in user code";
      return;
    }

    //Show loader while waiting for response
    loader.style.display = "flex";
    searchButton.style.display = "none";

    fetch("/api/users/getUserByUserCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userCode: userCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        //hide alert
        alert.style.display = "none";

        //hide loader when response is received
        loader.style.display = "none";
        searchButton.style.display = "block";

        console.log(data);
        if (data.error) {
          console.log(data.error);
          alert.style.display = "block";
          alert.innerText = data.error;
        } else if (data.message) {
          const user = data.user;

          fname.value = user.name;
          lname.value = user.surname;
          email.value = user.email;
        }
      })
      .catch((error) => {
        //hide loader when response is received
        loader.style.display = "none";
        searchButton.style.display = "block";

        console.log("Error:", error);
      });
  });

  submitFineButton.addEventListener("click", function (event) {
    event.preventDefault();

    //hide alert message
    var alert = document.getElementById("alert");
    alert.style.display = "none";

    let title = document.getElementById("title").value;
    let description = document.getElementById("description").value;

    if (description === "" || title === "") {
      //Show error message
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Please fill in all fields";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    //show loader while waiting for response
    var loader = document.getElementById("loaderSubmitFine");
    loader.style.display = "flex";

    // post request to generate code
    fetch("/api/fines/issueFine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userCode: document.getElementById("userCode").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        amount: document.getElementById("amount").value,
      }),
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
          alert.innerText = data.message + ". Redirecting...";
          alert.className =
            "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

          // Redirect to fines page
          setTimeout(() => {
            window.location.href = "/admin/manageFines";
          }, 1000);
        }
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  });
});
