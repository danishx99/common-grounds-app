document.addEventListener("DOMContentLoaded", function () {
  function getRoles(role) {
    let roles = ["Admin", "Staff", "Resident"];

    //retunr roles array without role
    return roles.filter((r) => r !== role);
  }

  fetch("/api/users/getAllUsers")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      //do stuff
      console.log(data.users);

      let users = data.users;

      let table = document.getElementById("usersTable");
      let tableBody = document.getElementById("tbody");

      let updateImage = "../assets/edit.png";
      let deleteImage = "../assets/delete.svg";

      users.forEach((user) => {
        let otherRoles = getRoles(user.role);

        tableBody.innerHTML += `
                    <tr class="bg-white border-b hover:bg-gray-200">
                    <th scope="row" class="px-3 py-1 font-medium text-gray-900 text-center ">
                        ${user.name} ${user.surname}
                    </th>
                    <td class="px-6 py-1 text-center w-[15%]">
                        ${user.email}
                    </td>
                    <td class="px-4 py-1 text-center w-[15%]">
                        ${user.userCode}
                    </td>
                    <td class="px-5 py-1 text-center w-[15%]">
                        <select class="py-1.5 text-center text-xs rounded-3xl bg-gray-100 w-[100%] border-black" name=""
                            id="">
                            <option value="${user.role}">${user.role}</option>
                            <option value="${otherRoles[0]}">${otherRoles[0]}</option>
                            <option value="${otherRoles[1]}">${otherRoles[1]}</option>        
                        </select>
                    </td>


                    <td class="px-6 py-1 text-center w-[15%] mx-auto">
                        <div class="flex justify-center">
                        <img src="${updateImage}" class="w-6 h-6">
                        </div>
                    </td>

                    <td class="px-6 py-1 text-center w-[15%] ">
                        <div class="flex justify-center" >
                            <img src="${deleteImage}" class="w-6 h-6"> 
                        </div>
       
                    </td>
                </tr>`;
      });
    })
    .catch((error) => {
      console.log("Error:", error);
    });
});
