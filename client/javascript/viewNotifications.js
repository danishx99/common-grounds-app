let logo = document.getElementById("logo");
const mainLoader = document.getElementById("mainLoader");
const finesInfo = document.getElementById("finesInfo");






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


