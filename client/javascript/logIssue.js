document.addEventListener("DOMContentLoaded", function () {
  var submitIssue = document.getElementById("submitIssue");
  var logout = document.getElementById("logout");
  var logo = document.getElementById("logo");
  const textArea = document.getElementById("description");
  const charCount = document.getElementById("char-count");
  const back = document.getElementById("back");

  back.addEventListener("click", function () {
    window.location.href = "/resident/manageIssues";
  });

  // Update character count on input
  textArea.addEventListener("input", () => {
    const charactersLeft = 250 - textArea.value.length;
    charCount.textContent = `${charactersLeft} characters remaining`;

    // Optional: Disable submit button or show warning if exceeding limit
    if (charactersLeft < 0) {
      // Add logic to disable submit button or display a warning message
      charCount.style.color = "red";
      charCount.textContent = "Word limit exceeded!";
      submitIssue.disabled = true;
    } else {
      charCount.style.color = "black";
      submitIssue.disabled = false;
    }
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

  submitIssue.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Issue button clicked");

    //hide alert message
    var alert = document.getElementById("alert");
    alert.style.display = "none";

    let description = document.getElementById("description").value;

    if (description === "") {
      //Show error message
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Please enter a description";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

      return;
    }

    //show loader while waiting for response
    var loader = document.getElementById("loaderSubmitIssue");
    loader.style.display = "flex";

    // post request to generate code
    fetch("/api/issues/logIssue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: document.getElementById("issueSelect").value,
        description: document.getElementById("description").value,
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
          alert.innerText = data.message;
          alert.className =
            "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
        }
      })
      .catch((error) => {
        console.log("Error:", error);
        loader.style.display = "none";
        //Show error message
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = "Error logging issue";
        alert.className =
          "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      });
  });
});
