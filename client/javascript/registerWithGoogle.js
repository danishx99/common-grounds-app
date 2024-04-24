var registerWithGoogle = document.getElementById("register-with-google");

registerWithGoogle.addEventListener("click", function (event) {
  event.preventDefault();

  // var role = document.getElementById("acc-type").value;
  // var code = document.getElementById("code").value;

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

      //post request to register user
      fetch("/api/auth/login-with-google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email }),
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
          } else if (data.success) {
            //Show success login message
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText = "You have successfully registered with Google";
          }
        })
        .catch((error) => {
          console.log("Error:", error);
          loader.style.display = "none";
          alert("An error occurred. Please try again");
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
