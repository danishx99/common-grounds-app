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

fetch("/api/issues/getAllIssues")
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
      Issued: "text-red-500",
      "In Progress": "text-yellow-400",
      Completed: "text-green-500",
    };

    // Get other statuses other than current
    const allStatus = ["Issued", "In Progress", "Completed"];

    function getOtherStatus(currentStatus) {
      return allStatus.filter((status) => {
        return status !== currentStatus && status !== "Issued";
      });
    }

    let updateImage = "../assets/edit.png";
    let checkImage = "../assets/check.svg";
    let crossImage = "../assets/cross.svg";

    issues.forEach((issue) => {
      let color = statusColors[issue._doc.status];

      let otherStatus = getOtherStatus(issue._doc.status);

      let options = "";

      otherStatus.forEach((status) => {
        options += `<option value="${status}">${status}</option>`;
      });

      tableBody.innerHTML += `
                    <tr class="bg-white border-b hover:bg-gray-200 ">

                    <th scope="row" class="px-5 py-1 font-medium text-gray-900 text-left ">
                        ${issue._doc.title}
                    </th>

                    <td class="px-5 py-2.5 text-left">
                        ${issue._doc.description}
                    </td>

                    <td class="px-5 py-2.5 text-left">
                        ${issue.name}
                    </td>

                    <td class="px-5 py-2.5 text-left">
                        ${issue._doc.reportedBy}
                    </td>

                      <td class="px-5 py-2.5 text-left">
                        ${formatDate(issue._doc.dateIssued)}
                    </td>

                    <td class="px-5 py-1 text-center  font-bold" >

                    <div class="flex justify-evenly class="">
                        <select class="py-1.5 text-center text-xs rounded-3xl bg-gray-100 w-[65%]  border-black " name=""  >
                            <option value="${issue._doc.status}">${
        issue._doc.status
      }  </option>
                            ${options}
                        </select>
                        <img id="update_${
                          issue._doc._id
                        }" src="${updateImage}" class="w-6 h-6 cursor-pointer">
                                                 <svg aria-hidden="true"
                        class="w-6 h-6 ml-2 hidden text-green-200 animate-spin dark:text-gray-600 fill-[#004621]"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" id="updateLoader_${
                          issue._doc._id
                        }">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                        </svg>
                        <img id="checkUpdate_${
                          issue._doc._id
                        }" src="${checkImage}" class="w-6 h-6 ml-2 hidden">
                        <img id="crossUpdate_${
                          issue._doc._id
                        }" src="${crossImage}" class="w-6 h-6 ml-2 hidden">
                        </div>

                    </td>
                    

                </tr>`;
    });

    document.getElementById("tbody").addEventListener("click", (event) => {
      if (event.target && event.target.id.startsWith("update_")) {
        event.preventDefault();
        let issueId = event.target.id.split("_")[1];
        let status = event.target.previousElementSibling.value;

        // Show loader
        document
          .getElementById(`updateLoader_${issueId}`)
          .classList.remove("hidden");

        fetch(`/api/issues/updateIssueStatus`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ issueId, status }),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            console.log(data.message);

            if (data.error) {
              // Hide loader
              document
                .getElementById(`updateLoader_${issueId}`)
                .classList.add("hidden");

              // show cross image for 3 seconds
              document
                .getElementById(`crossUpdate_${issueId}`)
                .classList.remove("hidden");
              setTimeout(() => {
                document
                  .getElementById(`crossUpdate_${issueId}`)
                  .classList.add("hidden");
              }, 3000);

              // Show error modal
              showErrorModal("An error occurred while updating this issue.");
            } else if (data.message) {
              // Hide loader
              document
                .getElementById(`updateLoader_${issueId}`)
                .classList.add("hidden");

              // show check image for 3 seconds
              document
                .getElementById(`checkUpdate_${issueId}`)
                .classList.remove("hidden");
              setTimeout(() => {
                document
                  .getElementById(`checkUpdate_${issueId}`)
                  .classList.add("hidden");
              }, 3000);
            }
          })
          .catch((error) => {
            // Hide loader
            document
              .getElementById(`updateLoader_${issueId}`)
              .classList.add("hidden");
            // show cross image for 3 seconds

            document
              .getElementById(`crossUpdate_${issueId}`)
              .classList.remove("hidden");
            setTimeout(() => {
              document
                .getElementById(`crossUpdate_${issueId}`)
                .classList.add("hidden");
            }, 3000);

            // Show error modal
            showErrorModal("An error occurred while updating this issue.");

            console.log("Error:", error);
          });
      }

      //listen for a change in the select element so we can update color
      if (event.target && event.target.tagName === "SELECT") {
        //let color = statusColors[event.target.value];
        //console.log(color);
        //update the class of the select element to the new color
        //event.target.classList = `py-1.5 text-center text-xs rounded-3xl bg-gray-100 w-[65%]  border-black" name="" ${color}`;
      }
    });
  })
  .catch((error) => {
    console.log("Error:", error);
    issueInfo.classList.add("hidden");
    mainLoader.classList.add("hidden");
   

    console.log("Error:", error);
    //show error in form of modal
    showErrorModal("An error occurred. Please try again later.");
  });


// Search functionality
let search = document.getElementById("table-search");
search.addEventListener("keyup", function () {
    let value = search.value.toLowerCase().trim();
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach((row) => {
        // Clone the row to manipulate and remove dropdown values
        let rowClone = row.cloneNode(true);
        
        // Remove the text within dropdowns for main search
        rowClone.querySelectorAll("select").forEach(select => select.remove());
        
        // Get the text content of the cloned row (without dropdown values)
        let rowText = rowClone.textContent.toLowerCase().trim();

        // Additionally get the text content of the status dropdown
        let statusText = "";
        let statusSelect = row.querySelector("select");
        if (statusSelect) {
            statusText = statusSelect.options[statusSelect.selectedIndex].text.toLowerCase().trim();
        }

        // Combine the row text and status text for searching
        let combinedText = rowText + " " + statusText;

        // Debugging: Log the row text to see the contents
        console.log("Row text: ", combinedText);

        // Check if the combined text includes the search value
        if (combinedText.includes(value)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});