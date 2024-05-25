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

fetch("/api/fines/getUserFines")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    //do stuff
    console.log(data.fines);

    setTimeout(function () {
      mainLoader.classList.add("hidden");
      finesInfo.classList.remove("hidden");
    }, 1500);

    let fines = data.fines;

    let tableBody = document.getElementById("tbody");

    
    let checkImage = "../assets/check.svg";
    let crossImage = "../assets/cross.svg";
    let pay = "../assets/pay.png";

    fines.forEach((fine) => {

      // get current date and date 30 days from issue date
      const currentDate = new Date();
      const issueDate = new Date(fine.dateIssued);
      const dueDate = new Date(issueDate.setDate(issueDate.getDate() + 30));

      tableBody.innerHTML += `
                    <tr class="bg-white border-b hover:bg-gray-200 ">

                    <th scope="row" class="px-3 py-1 font-medium text-gray-900 text-left ">
                        ${fine.title}   
                    </th>

                    <td class="px-4 py-2.5 text-left">
                        ${fine.description}
                    </td>

                    <td class="px-4 py-2.5 text-left">
                        R${fine.amount}
                    </td>

                    <td class="px-4 py-2.5 text-left ">
                        ${formatDate(fine.dateIssued)}
                    </td>

                    <td class="px-4 py-2.5 text-left">
                    ${
                      // show due date, and if fine is overdue, show overdue message in addition
                      currentDate > dueDate
                        ? `${formatDate(dueDate)} <div class='text-red-500 font-bold'>Overdue</div>`
                        : formatDate(dueDate)



                    }
                </td>

                      <td class="px-4 py-2.5 text-left">
                        ${fine.issuedBy}
                    </td>

                  

                    <td id="checkout_${
                      fine._id
                    }" class="px-4 py-1 text-left">
                        ${
                          fine.isPaid
                            ? "<div class='flex text-left text-green-600 font-bold'>Paid</div>"
                            : `<div class='flex text-left text-red-500 font-bold'>Unpaid</div>`
                        } 
                    </td>

                </tr>`;
    });

  })
  .catch((error) => {
    console.log("Error:", error);

    //show error in form of modal
    showErrorModal("An error occurred. Please try again later.");
  });


  //Table search functionality
  let search = document.getElementById("table-search");
  search.addEventListener("keyup", function () {
    let value = search.value.toLowerCase().trim();
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      let rowText = row.textContent.toLowerCase().trim();
      console.log("Row text: ", rowText); 


      if (rowText.includes(value)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });