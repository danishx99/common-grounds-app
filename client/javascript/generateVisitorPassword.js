document.addEventListener("DOMContentLoaded", function () {
  var generatePassButton = document.getElementById("generatePassButton");
  const logout = document.getElementById("logout");
  const logo = document.getElementById("logo");
  const back = document.getElementById("back");
  const redCircle = document.getElementById("redCircle");
  const notificationList = document.getElementById("notificationList");

  const fetchNotifications = async () => {
    //get request to /api/fines/hasUnreadFines
    await fetch("/api/fines/hasUnreadFines")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.unreadFines > 0) {
          redCircle.style.display = "block";
          notificationList.innerHTML += `<li><a id="notificationFine" class="block px-4 py-2 hover:bg-gray-100">You have been issued ${data.unreadFines} new fines.</a></li>`;
          document
            .getElementById("notificationFine")
            .addEventListener("click", function () {
              window.location.href = "/resident/viewFines";
            });
        }
        if (data.error) {
          notificationList.innerHTML += `<li><a class="block px-4 py-2 hover:bg-gray-100">An error occurred while fetching fines.</a></li>`;
        }
      })
      .catch((error) => {
        //append error message to notification list
        notificationList.innerHTML += `<li><a class="block px-4 py-2 hover:bg-gray-100">An error occurred while fetching fines.</a></li>`;
        console.log("Error:", error);
      });

    //get request to /api/notifications/getUnreadNotifications
    await fetch("/api/notifications/getUnreadNotifications")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.unreadNotifications > 0) {
          redCircle.style.display = "block";
          notificationList.innerHTML += `<li><a id="notificationNotification" class="block px-4 py-2 hover:bg-gray-100"> You have ${data.unreadNotifications} unread notifications.</a></li>`;
          document
            .getElementById("notificationNotification")
            .addEventListener("click", function () {
              window.location.href = "/resident/viewNotifications";
            });
        }
        if (data.error) {
          notificationList.innerHTML += `<li><a class="block px-4 py-2 hover:bg-gray-100">An error occurred while fetching your notifications.</a></li>`;
        }
      })
      .catch((error) => {
        //append error message to notification list
        notificationList.innerHTML += `<li><a class="block px-4 py-2 hover:bg-gray-100">An error occurred while fetching your notifications.</a></li>`;
        console.log("Error:", error);
      });

    //get request to get extreme weather events
    await fetch("/api/notifications/getExtremeWeatherNotifications")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.extremeWeather === true) {
          redCircle.style.display = "block";
          notificationList.innerHTML += `<li><a id="weatherNotification" class="block px-4 py-2 hover:bg-gray-100"> ${data.currCondition}!</a></li>`;
          document
            .getElementById("weatherNotification")
            .addEventListener("click", function () {
              window.location.href = "/resident/viewNotifications";
            });
        }
        if (data.error) {
          notificationList.innerHTML += `<li><a class="block px-4 py-2 hover:bg-gray-100">An error occurred while fetching the weather conditions.</a></li>`;
        }
      })
      .catch((error) => {
        //append error message to notification list
        notificationList.innerHTML += `<li><a class="block px-4 py-2 hover:bg-gray-100">An error occurred while fetching the weather conditions.</a></li>`;
        console.log("Error:", error);
      });

    //check if notificationList is empty
    if (notificationList.innerHTML.trim() === "") {
      notificationList.innerHTML += `<li><a class="block px-4 py-2 cursor-not-allowed">You have no new notifications.</a></li>`;
    }
  };

  fetchNotifications();

  back.addEventListener("click", function () {
    window.location.href = "/";
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

  generatePassButton.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Generate Password button clicked");

    //show loader while waiting for response
    var loader = document.getElementById("loaderGenerateCode");
    loader.style.display = "flex";

    // post request to generate code
    fetch("/api/auth/generateVisitorPassword", {
      method: "POST",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);

        //hide loader when response is received
        loader.style.display = "none";

        if (data.error && !data.password) {
          //Show error message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = data.error;
          alert.className =
            "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
        } else if (data.message && data.password) {
          //Show error message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = data.message;
          alert.className =
            "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
          //Place password inside textbox
          var password = document.getElementById("passPlaceholder");
          password.value = data.password;
        } else if (data.password) {
          //Show success message
          var alert = document.getElementById("alert");
          alert.style.display = "block";
          alert.innerText = "Generated successfully.";
          alert.className =
            "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

          //Place password inside textbox
          var password = document.getElementById("passPlaceholder");
          password.value = data.password;
        }
      })
      .catch((error) => {
        console.log("Error:", error);
        loader.style.display = "none";
      });
  });
});
