let logo = document.getElementById("logo");
const mainLoader = document.getElementById("mainLoader");
const finesInfo = document.getElementById("finesInfo");
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
        document.getElementById("notificationNotification")
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


  //check if notificationList is empty
  if (notificationList.innerHTML.trim() === "") {
    notificationList.innerHTML += `<li><a class="block px-4 py-2 cursor-not-allowed">You have no new notifications.</a></li>`;
  }
};

  
fetchNotifications();



// Function to display error modal with a message
function showErrorModal(message) {
  // Set error message
  document.getElementById("errorMessage").textContent = message;
  // Show modal
  $("#errorModal").modal("show");
}

function formatDate(date) {
  let date1 = new Date(date);
  let formattedDate = date1.toLocaleDateString("en-GB"); // Format: MM/DD/YYYY
  let formattedTime = date1.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  }); // Format: HH:MM:SS AM/PM

  // Concatenate date and time
  let formattedDateTime = formattedDate + " " + formattedTime;

  return formattedDateTime;
}

// Example usage:
// showErrorModal('An error occurred. Please try again later.');

logo.addEventListener("click", () => {
  window.location.href = "/";
});

var logout = document.getElementById("logout");

logout.addEventListener("click", function () {
  //get request to /clear
  fetch("/clear")
    .then((res) => res.text())
    .then((data) => {
      console.log(data);
      window.location.href = "/";
    });
});

mainLoader.classList.remove("hidden");
finesInfo.classList.add("hidden");

fetch("/api/notifications/getNotifications")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    //do stuff
    console.log(data.notifications);

    setTimeout(function () {
      mainLoader.classList.add("hidden");
      finesInfo.classList.remove("hidden");
    }, 1500);

    let notifications = data.notifications;

    let tableBody = document.getElementById("tbody");

    
    let checkImage = "../assets/check.svg";
    let crossImage = "../assets/cross.svg";
    let pay = "../assets/pay.png";

    notifications.forEach((notification) => {

      // get current date and date 30 days from issue date
      const currentDate = new Date();
      const issueDate = new Date(notification.dateIssued);
      const dueDate = new Date(issueDate.setDate(issueDate.getDate() + 30));

      tableBody.innerHTML += `
                    <tr class="bg-white border-b hover:bg-gray-200 ">

                    <th scope="row" class="px-3 py-1 font-medium text-gray-900 text-center ">
                        ${notification.title}   
                    </th>

                    <td class="px-4 py-2.5 text-center w-[25%]">
                        ${notification.description}
                    </td>


                    <td class="px-4 py-2.5 text-center w-[10%]">
                        ${formatDate(notification.dateIssued)}
                    </td>

                  

                      <td class="px-4 py-2.5 text-center w-[10%]">
                        ${notification.issuedBy}
                    </td>


                </tr>`;
    });

  })
  .catch((error) => {
    console.log("Error:", error);

    //show error in form of modal
    showErrorModal("An error occurred. Please try again later.");
  });


