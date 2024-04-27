document.addEventListener("DOMContentLoaded", function() {
    var userManagementLink = document.getElementById("user_management_link");



    userManagementLink.addEventListener("click", function(event) {
        event.preventDefault();
        
        console.log("User Management Link button clicked");

        
    });
});