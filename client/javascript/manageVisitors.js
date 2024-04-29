let logo = document.getElementById("logo");
const mainLoader = document.getElementById("mainLoader");
const userInfo = document.getElementById("userInfo");
const checkIn = document.getElementById("checkIn");

checkIn.addEventListener("click", () => {
  window.location.href = "/admin/checkInVisitor";
});

// Function to display error modal with a message
function showErrorModal(message) {
  // Set error message
  document.getElementById("errorMessage").textContent = message;
  // Show modal
  $("#errorModal").modal("show");
}

function formatDate(date) {
 
  let date1 = new Date(date);
  let formattedDate = date1.toLocaleDateString('en-GB'); // Format: MM/DD/YYYY
  let formattedTime = date1.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }); // Format: HH:MM:SS AM/PM

  // Concatenate date and time
  let formattedDateTime = formattedDate + " " + formattedTime;

  return formattedDateTime;
}

// Example usage:
// showErrorModal('An error occurred. Please try again later.');

logo.addEventListener("click", () => {
  window.location.href = "/admin";
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
visitorInfo.classList.add("hidden");

fetch("/api/visitors/getAllVisitors")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    //do stuff
    console.log(data.visitors);

   

    setTimeout(function () {
      mainLoader.classList.add("hidden");
      visitorInfo.classList.remove("hidden");
    }, 1500);

    let visitors = data.visitors;

    let table = document.getElementById("visitorsTable");
    let tableBody = document.getElementById("tbody");

    
    let checkImage = "../assets/check.svg";
    let crossImage = "../assets/cross.svg";


    visitors.forEach((user) => {
      
    

      tableBody.innerHTML += `
                    <tr id="row_${user.identificationNumber}" class="bg-white border-b hover:bg-gray-200 ">
                    <th scope="row" class="px-3 py-1 font-medium text-gray-900 text-center ">
                        ${user.name}
                    </th>
                    <td class="px-6 py-2.5 text-center w-[15%]">
                        ${formatDate(user.checkInTime)}
                    </td>
                    <td id="checkout_${user.identificationNumber}" class="px-4 py-1 text-center w-[15%]">
                        ${user.checkOutTime ? formatDate(user.checkOutTime) : 

                          `<div class='flex justify-center'>
                          <img src='../assets/sign-out.svg' id="checkout_${user.identificationNumber}" class='w-6 h-6 cursor-pointer' alt='Not checked out'>

                          <svg aria-hidden="true"
                          class="w-6 h-6 ml-2 hidden text-green-200 animate-spin dark:text-gray-600 fill-[#004621]"
                          viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" id="updateLoader_${user.identificationNumber}">
                          <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor" />
                          <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill" />
                          </svg>
                          <img id="checkUpdate_${user.identificationNumber}" src="${checkImage}" class="w-6 h-6 ml-2 hidden">
                          <img id="crossUpdate_${user.identificationNumber}" src="${crossImage}" class="w-6 h-6 ml-2 hidden">

                          </div>`
                        
                        } 
                    </td>
                    <td class="px-5 py-2.5 text-center w-[15%]">
                        ${user.identificationNumber}
                    </td>
                    <td class="px-5 py-2.5 text-center w-[15%]">
                    ${user.cellPhoneNumber}
                   </td>
                   <td class="px-5 py-2.5 text-center w-[15%]">
                   ${user.userCode}
                  </td>

                </tr>`;
    });

    document.getElementById("tbody").addEventListener("click", (event) => {
      if (event.target && event.target.id.startsWith("checkout_")) {
        event.preventDefault();

        // Extract the user code from the update button's id
        let userId = event.target.id.split("_")[1];


        //show loader
        document
          .getElementById(`updateLoader_${userId}`)
          .classList.remove("hidden");

        // Send the update request
        fetch("/api/visitors/manageVisitors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: userId
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              //hide loader
              document
                .getElementById(`updateLoader_${userId}`)
                .classList.add("hidden");
              //show cross for 3 seconds
              document
                .getElementById(`crossUpdate_${userId}`)
                .classList.remove("hidden");
              setTimeout(function () {
                document
                  .getElementById(`crossUpdate_${userId}`)
                  .classList.add("hidden");
              }, 1500);
              showErrorModal(data.error);
              return;
            }

            //hide loader
            document
              .getElementById(`updateLoader_${userId}`)
              .classList.add("hidden");
           

            document.getElementById(`checkout_${userId}`).innerHTML = `<div class='flex justify-center'>${formatDate(data.visitor.checkOutTime)}</div>`;


          })
          .catch((error) => {
            //hide loader
            document
              .getElementById(`updateLoader_${userId}`)
              .classList.add("hidden");
            //show cross for 3 seconds
            document
              .getElementById(`crossUpdate_${userId}`)
              .classList.remove("hidden");
            setTimeout(function () {
              document
                .getElementById(`crossUpdate_${userId}`)
                .classList.add("hidden");
            }, 1500);

            showErrorModal("Error checking out visitor");
            console.log("Error:", error);
          });
      } else if (event.target && event.target.id.startsWith("delete_")) {
        event.preventDefault();

        // Extract the user code from the delete button's id
        const userCode = event.target.id.split("_")[1];

        // Show the loader
        document
          .getElementById(`loader_${userCode}`)
          .classList.remove("hidden");

        // Send the delete request
        fetch("/api/visitors/managevisitors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userCode: userCode,
            role: "",
            del: true,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              // Hide the loader
              document
                .getElementById(`loader_${userCode}`)
                .classList.add("hidden");
              //show cross for 3 seconds
              document
                .getElementById(`crossDelete_${userCode}`)
                .classList.remove("hidden");
              setTimeout(function () {
                document
                  .getElementById(`crossDelete_${userCode}`)
                  .classList.add("hidden");
              }, 1500);
              showErrorModal(data.error);
              return;
            }
            // Hide the loader
            document
              .getElementById(`loader_${userCode}`)
              .classList.add("hidden");
            console.log(data);
            //delete tr with id row_userCode
            document.getElementById(`row_${userCode}`).remove();
          })
          .catch((error) => {
            // Hide the loader
            document
              .getElementById(`loader_${userCode}`)
              .classList.add("hidden");
            //show cross for 3 seconds
            document
              .getElementById(`crossDelete_${userCode}`)
              .classList.remove("hidden");
            setTimeout(function () {
              document
                .getElementById(`crossDelete_${userCode}`)
                .classList.add("hidden");
            }, 1500);
            showErrorModal(error.message);
            console.log("Error:", error);
          });
      }
    });
  })
  .catch((error) => {
    console.log("Error:", error);
  });
