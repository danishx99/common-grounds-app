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
                       <span class="code">${notification.issuedBy}</span> 
                     

                    </td>


                </tr>`;

    });

   // <div data-popover id="popover-left" role="tooltip" class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800 -left-52 top-1/2 transform -translate-y-1/2">
    //      <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
    //          <h2 class="font-semibold text-gray-900 dark:text-white">Popover left</h3>
    //      </div>
    //      <div class="px-3 py-2">
    //          <p>And here's some amazing content. It's very engaging. Right?</p>
    //      </div>
    //      <div data-popper-arrow></div>
    //  </div>

    // const codes = document.querySelectorAll(".code");
    // const popovers = document.querySelectorAll("[data-popover]");

    
    
    // codes.forEach((code, index) => {
    //   const code_ = code.textContent;
    //   code.addEventListener("mouseover", () => {
    //     popoverstitle = popovers[index].querySelector("h2");
    //     popoverstitle.textContent = code_;
    //     popovers[index].classList.remove("invisible");
    //     popovers[index].classList.remove("invisible");
    //     popovers[index].classList.add("visible");
    //     popovers[index].classList.add("opacity-100");
    //   });

    //   code.addEventListener("mouseout", () => {
    //     popovers[index].classList.remove("visible");
    //     popovers[index].classList.add("invisible");
    //     popovers[index].classList.remove("opacity-100");
    //   });
    // });
   

    

  })
  .catch((error) => {
    console.log("Error:", error);

    //show error in form of modal
    showErrorModal("An error occurred. Please try again later.");
  });

