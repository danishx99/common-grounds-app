let logo = document.getElementById("logo");
const mainLoader = document.getElementById("mainLoader");
const userInfo = document.getElementById("userInfo");

// Function to display error modal with a message
function showErrorModal(message) {
  // Set error message
  document.getElementById("errorMessage").textContent = message;
  // Show modal
  $("#errorModal").modal("show");
}

// Example usage:
// showErrorModal('An error occurred. Please try again later.');

logo.addEventListener("click", () => {
  window.location.href = "/admin";
});

function getRoles(role) {
  let roles = ["Admin", "Staff", "Resident"];

  //retunr roles array without role
  return roles.filter((r) => r !== role);
}

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
userInfo.classList.add("hidden");

fetch("/api/users/getAllUsers")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    //do stuff
    //console.log(data.users);

    setTimeout(function () {
      mainLoader.classList.add("hidden");
      userInfo.classList.remove("hidden");
    }, 1500);

    let users = data.users;

    let table = document.getElementById("usersTable");
    let tableBody = document.getElementById("tbody");

    let updateImage = "../assets/edit.png";
    let deleteImage = "../assets/delete.svg";
    let checkImage = "../assets/check.svg";
    let crossImage = "../assets/cross.svg";

    users.forEach((user) => {
      let otherRoles = getRoles(user.role);

      tableBody.innerHTML += `
                    <tr id="row_${user.userCode}" class="bg-white border-b hover:bg-gray-200 ">
                    <th scope="row" class="px-3 py-1 font-medium text-gray-900 text-center ">
                        ${user.name} ${user.surname}
                    </th>
                    <td class="px-6 py-1 text-center w-[15%]">
                        ${user.email}
                    </td>
                    <td id="userCode_${user.userCode}" class="px-4 py-1 text-center w-[15%]">
                        ${user.userCode}
                    </td>
                    <td class="px-5 py-1 text-center w-[15%]">
                        <select class="py-1.5 text-center text-xs rounded-3xl bg-gray-100 w-[100%] border-black" name=""
                            id="select_${user.userCode}">
                            <option value="${user.role}">${user.role}</option>
                            <option value="${otherRoles[0]}">${otherRoles[0]}</option>
                            <option value="${otherRoles[1]}">${otherRoles[1]}</option>        
                        </select>
                    </td>


                    <td class="px-6 py-1 text-center w-[15%] mx-auto">
                        <div class="flex justify-center">
                        <img id="update_${user.userCode}" src="${updateImage}" class="w-6 h-6 cursor-pointer">
                         <svg aria-hidden="true"
                        class="w-6 h-6 ml-2 hidden text-green-200 animate-spin dark:text-gray-600 fill-[#004621]"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" id="updateLoader_${user.userCode}">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                        </svg>
                        <img id="checkUpdate_${user.userCode}" src="${checkImage}" class="w-6 h-6 ml-2 hidden">
                        <img id="crossUpdate_${user.userCode}" src="${crossImage}" class="w-6 h-6 ml-2 hidden">

                        
                        </div>
                    </td>

                    <td class="px-6 py-1 text-center w-[15%] ">
                        <div class="flex justify-center" >
                            <img id="delete_${user.userCode}" src="${deleteImage}" class="w-6 h-6 cursor-pointer"> 
                        <svg aria-hidden="true"
                        class="w-6 h-6 ml-2 hidden text-green-200 animate-spin dark:text-gray-600 fill-[#004621]"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg" id="loader_${user.userCode}">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                        </svg>
                        <img id="crossDelete_${user.userCode}" src="${crossImage}" class="w-6 h-6 ml-2 hidden">

                        </div>
       
                    </td>
                </tr>`;
    });

    document.getElementById("tbody").addEventListener("click", (event) => {
      if (event.target && event.target.id.startsWith("update_")) {
        event.preventDefault();

        // Extract the user code from the update button's id
        let userCode = event.target.id.split("_")[1];

        // Get the new role from the corresponding select element
        const newRole = document.getElementById(`select_${userCode}`).value;

        console.log("New role this time is " + newRole)

        //show loader
        document
          .getElementById(`updateLoader_${userCode}`)
          .classList.remove("hidden");

        // Send the update request
        fetch("/api/users/manageUsers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userCode: userCode,
            role: newRole,
            del: false,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              //hide loader
              document
                .getElementById(`updateLoader_${userCode}`)
                .classList.add("hidden");
              //show cross for 3 seconds
              document
                .getElementById(`crossUpdate_${userCode}`)
                .classList.remove("hidden");
              setTimeout(function () {
                document
                  .getElementById(`crossUpdate_${userCode}`)
                  .classList.add("hidden");
              }, 1500);
              showErrorModal(data.error);
              return;
            }

            //hide loader
            document
              .getElementById(`updateLoader_${userCode}`)
              .classList.add("hidden");
            //show check for 3 seconds
            document
              .getElementById(`checkUpdate_${userCode}`)
              .classList.remove("hidden");
          
            let newUserCode = data.user.userCode;
            //userCode = newUserCode;

            document.getElementById(`userCode_${userCode}`).textContent = newUserCode;

            //Update all the id's of the elements to use the new user code
            document.getElementById(`update_${userCode}`).id = `update_${newUserCode}`;
            document.getElementById(`select_${userCode}`).id = `select_${newUserCode}`;
            document.getElementById(`userCode_${userCode}`).id = `userCode_${newUserCode}`;
            document.getElementById(`updateLoader_${userCode}`).id = `updateLoader_${newUserCode}`;
            document.getElementById(`checkUpdate_${userCode}`).id = `checkUpdate_${newUserCode}`;
            document.getElementById(`crossUpdate_${userCode}`).id = `crossUpdate_${newUserCode}`;
            document.getElementById(`delete_${userCode}`).id = `delete_${newUserCode}`;
            document.getElementById(`loader_${userCode}`).id = `loader_${newUserCode}`;
            document.getElementById(`crossDelete_${userCode}`).id = `crossDelete_${newUserCode}`;
            document.getElementById(`row_${userCode}`).id = `row_${newUserCode}`;

            setTimeout(function () {
              document
              .getElementById(`checkUpdate_${newUserCode}`)
              .classList.add("hidden");
            }, 1500);
            

          })
          .catch((error) => {
            //hide loader
            document
              .getElementById(`updateLoader_${userCode}`)
              .classList.add("hidden");
            //show cross for 3 seconds
            document
              .getElementById(`crossUpdate_${userCode}`)
              .classList.remove("hidden");
            setTimeout(function () {
              document
                .getElementById(`crossUpdate_${userCode}`)
                .classList.add("hidden");
            }, 1500);

            showErrorModal("There was an error updating the user. Please try again later.");
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
        fetch("/api/users/manageUsers", {
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
            showErrorModal("There was an error deleting the user. Please try again later.");
            console.log("Error:", error);
          });
      }
    });
  })
  .catch((error) => {
    console.log("Error:", error);
    
    //show error in form of modal
    showErrorModal("An error occurred. Please try again later.");
  });
