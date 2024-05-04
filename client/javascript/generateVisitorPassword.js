document.addEventListener("DOMContentLoaded", function () {

    var generatePassButton = document.getElementById("generatePassButton");  
    const logout = document.getElementById("logout");
    const logo = document.getElementById("logo");

    logo.addEventListener("click", function () {
        window.location.href = "/";
    });

    logout.addEventListener("click", function () {
        //get request to /clear
        fetch("/clear")
            .then((res) => res.text())
            .then((data) => {
                console.log(data);
                window.location.href = "/";
            });
    });


    generatePassButton.addEventListener("click", function (event) {
        event.preventDefault();
        console.log("Generate Password button clicked");

        //show loader while waiting for response
        var loader = document.getElementById("loaderGenerateCode");
        loader.style.display = "flex";

        // post request to generate code
        fetch("/api/auth/generateVisitorPassword", {
            method: "POST",

        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {

                console.log(data);

                //hide loader when response is received
                loader.style.display = "none";

                if(data.error && !data.password){

                    //Show error message
                    var alert = document.getElementById("alert");
                    alert.style.display = "block";
                    alert.innerText = data.error;
                    alert.className =
                        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

                } else if (data.message && data.password) {
                    //Show error message
                    var alert = document.getElementById("alert");
                    alert.style.display = "block";
                    alert.innerText = data.message;
                    alert.className =
                        "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
                         //Place password inside textbox
                         var password = document.getElementById("passPlaceholder");
                         password.value = data.password;

                  
                } 
                else if (data.password) {
                    //Show success message
                    var alert = document.getElementById("alert");
                    alert.style.display = "block";
                    alert.innerText = "Generated successfully.";
                    alert.className =
                        "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

                        //Place password inside textbox
                        var password = document.getElementById("passPlaceholder");
                        password.value = data.password;


                }
            }).catch((error) => {
                console.log("Error:", error);
                loader.style.display = "none";
                
               


            });






    });
    



});