document.addEventListener("DOMContentLoaded", function () {
  var registerWithGoogle = document.getElementById("register-with-google");
  var proceedWithGoogle = document.getElementById("proceed-with-google");
  var submitButton = document.getElementById("submitButton");

  var form1 = document.getElementById("form-p1");
  var form2 = document.getElementById("form-p2");
  var back = document.getElementById("back");

  const firebaseConfig = {
    apiKey: "AIzaSyCtpyCzfGywbnGc4MQl3Sv_jDt_3JPSxl0",
    authDomain: "commongrounds-420608.firebaseapp.com",
    projectId: "commongrounds-420608",
    storageBucket: "commongrounds-420608.appspot.com",
    messagingSenderId: "940662765230",
    appId: "1:940662765230:web:71339aa44caa538d541f3f",
    measurementId: "G-3ZSK3L2G23",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  back.addEventListener("click", function (event) {
    console.log("Back button clicked");
    form1.className = "register-show-form1";
    form2.className = "register-hide-form2";
    back.style.display = "none";
    registerWithGoogle.style.display = "flex";
    var alert = document.getElementById("alert");
    alert.style.display = "none";
  });

  proceedWithGoogle.addEventListener("click", function (event) {
    event.preventDefault();
    form1.className = "register-hide-form1";
    form2.className = "register-show-form2";
    back.style.display = "block";
    submitButton.style.display = "none";
    registerWithGoogle.style.display = "flex";
  });

  registerWithGoogle.addEventListener("click", function (event) {
    event.preventDefault();

    console.log("Register with Google button clicked");

    var role = document.getElementById("acc-type").value;
    var code = document.getElementById("code").value;

    if (!code || code === "") {
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "Please fill in all fields";
      alert.className =
        "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
      return;
    }

    const auth = firebase.auth();

    const provider = new firebase.auth.GoogleAuthProvider();

    auth
      .signInWithPopup(provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        //   console.log(user);
        var email = user.email;
        var firstName = user.displayName.split(" ")[0];
        var lastName = user.displayName.split(" ")[1];

        //show loader while waiting for response
        var loader = document.getElementById("loader");
        loader.style.display = "flex";

        //post request to register user
        fetch("/api/auth/register-with-google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: firstName,
            surname: lastName,
            email,
            role,
            code,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            //hide loader when response is received
            loader.style.display = "none";

            if (data.error) {
              //Show error message
              var alert = document.getElementById("alert");
              alert.style.display = "block";
              alert.innerText = data.error;
            } else {
              //Show success login message
              var alert = document.getElementById("alert");
              alert.style.display = "block";
              alert.innerText = "You have successfully registered with Google";
              alert.className =
                "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
            }
          })
          .catch((error) => {
            console.log("Error:", error);
            loader.style.display = "none";
          });
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(error);
        // ...
      });
  });
});
