let logIssue = document.getElementById("logIssue");

logIssue.addEventListener("click", function () {
  window.location.href = "/resident/logIssue";
});

let logo = document.getElementById("logo");
const mainLoader = document.getElementById("mainLoader");
const issueInfo = document.getElementById("issueInfo");

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
issueInfo.classList.add("hidden");

fetch("/api/issues/getUserIssues")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    //do stuff
    console.log(data.issues);

    setTimeout(function () {
      mainLoader.classList.add("hidden");
      issueInfo.classList.remove("hidden");
    }, 1500);

    let issues = data.issues;

    let tableBody = document.getElementById("tbody");

    // Define your status-color mapping
    const statusColors = {
      "Issued": "text-red-500",
      "In Progress": "text-yellow-400",
      "Completed": "text-green-500",
    };

    issues.forEach((issue) => {

      let color = statusColors[issue.status];

      tableBody.innerHTML += `
                    <tr class="bg-white border-b hover:bg-gray-200 ">
                    <th scope="row" class="px-5 py-1 font-medium text-gray-900 text-center ">
                        ${issue.title}
                    </th>
                    <td class="px-5 py-2.5 text-center w-[15%]">
                        ${issue.description}
                    </td>
                    <td class="px-5 py-1 text-center w-[15%] font-bold ${color}" >
                        ${issue.status}
                    </td>
                    <td class="px-5 py-2.5 text-center w-[15%]">
                        ${formatDate(issue.dateIssued)}
                    </td>
                </tr>`;
    });

    // document.getElementById("tbody").addEventListener("click", (event) => {
    //   if (event.target && event.target.id.startsWith("checkout_")) {
    //     event.preventDefault();

    //     // Extract the user code from the update button's id
    //     let userId = event.target.id.split("_")[1];

    //     //show loader
    //     document
    //       .getElementById(`updateLoader_${userId}`)
    //       .classList.remove("hidden");

    //     // Send the update request
    //     fetch("/api/visitors/manageVisitors", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         id: userId,
    //       }),
    //     })
    //       .then((res) => res.json())
    //       .then((data) => {
    //         if (data.error) {
    //           //hide loader
    //           document
    //             .getElementById(`updateLoader_${userId}`)
    //             .classList.add("hidden");
    //           //show cross for 3 seconds
    //           document
    //             .getElementById(`crossUpdate_${userId}`)
    //             .classList.remove("hidden");
    //           setTimeout(function () {
    //             document
    //               .getElementById(`crossUpdate_${userId}`)
    //               .classList.add("hidden");
    //           }, 1500);
    //           showErrorModal(data.error);
    //           return;
    //         }

    //         //hide loader
    //         document
    //           .getElementById(`updateLoader_${userId}`)
    //           .classList.add("hidden");

    //         document.getElementById(
    //           `checkout_${userId}`
    //         ).innerHTML = `<div class='flex justify-center'>${formatDate(
    //           data.visitor.checkOutTime
    //         )}</div>`;
    //       })
    //       .catch((error) => {
    //         //hide loader
    //         document
    //           .getElementById(`updateLoader_${userId}`)
    //           .classList.add("hidden");
    //         //show cross for 3 seconds
    //         document
    //           .getElementById(`crossUpdate_${userId}`)
    //           .classList.remove("hidden");
    //         setTimeout(function () {
    //           document
    //             .getElementById(`crossUpdate_${userId}`)
    //             .classList.add("hidden");
    //         }, 1500);

    //         showErrorModal("Error checking out visitor");
    //         console.log("Error:", error);
    //       });
    //   } else if (event.target && event.target.id.startsWith("delete_")) {
    //     event.preventDefault();

    //     // Extract the user code from the delete button's id
    //     const userCode = event.target.id.split("_")[1];

    //     // Show the loader
    //     document
    //       .getElementById(`loader_${userCode}`)
    //       .classList.remove("hidden");

    //     // Send the delete request
    //     fetch("/api/visitors/managevisitors", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         userCode: userCode,
    //         role: "",
    //         del: true,
    //       }),
    //     })
    //       .then((res) => res.json())
    //       .then((data) => {
    //         if (data.error) {
    //           // Hide the loader
    //           document
    //             .getElementById(`loader_${userCode}`)
    //             .classList.add("hidden");
    //           //show cross for 3 seconds
    //           document
    //             .getElementById(`crossDelete_${userCode}`)
    //             .classList.remove("hidden");
    //           setTimeout(function () {
    //             document
    //               .getElementById(`crossDelete_${userCode}`)
    //               .classList.add("hidden");
    //           }, 1500);
    //           showErrorModal(data.error);
    //           return;
    //         }
    //         // Hide the loader
    //         document
    //           .getElementById(`loader_${userCode}`)
    //           .classList.add("hidden");
    //         console.log(data);
    //         //delete tr with id row_userCode
    //         document.getElementById(`row_${userCode}`).remove();
    //       })
    //       .catch((error) => {
    //         // Hide the loader
    //         document
    //           .getElementById(`loader_${userCode}`)
    //           .classList.add("hidden");
    //         //show cross for 3 seconds
    //         document
    //           .getElementById(`crossDelete_${userCode}`)
    //           .classList.remove("hidden");
    //         setTimeout(function () {
    //           document
    //             .getElementById(`crossDelete_${userCode}`)
    //             .classList.add("hidden");
    //         }, 1500);
    //         showErrorModal(error.message);
    //         console.log("Error:", error);
    //       });
    //   }
    // });
  })
  .catch((error) => {
    console.log("Error:", error);
  });
