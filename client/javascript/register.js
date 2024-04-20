var submitButton = document.getElementById('submitButton');

submitButton.addEventListener('click', function(event) {
    event.preventDefault();

   console.log('Submit button clicked');

   // Validate form fields
   var fname = document.getElementById('fname').value;
   var lname = document.getElementById('lname').value;
   var email = document.getElementById('email').value;
   var password = document.getElementById('psw').value;
   var confirmPassword = document.getElementById('psw-confirm').value;

   if (!fname || !lname || !email || !password || !confirmPassword || fname === "" || lname === "" || email === "" || password === "" || confirmPassword === "") {
    var alert = document.getElementById('alert');
    alert.style.display = 'block';
    alert.innerText = "Please fill in all fields";
    return;
   }


   //show loader while waiting for response
   var loader = document.getElementById('loader');
   loader.style.display = 'flex';


   // post request to register user
   fetch('/api/auth/register', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         name: document.getElementById('fname').value,
         surname: document.getElementById('lname').value,
         email: document.getElementById('email').value,
         password: document.getElementById('psw').value,
         confirmPassword: document.getElementById('psw-confirm').value,
         role: document.getElementById('acc-type').value,
      }),
   })
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         console.log(data);
         //hide loader when response is received
         loader.style.display = 'none';

       
         if(data.message === "User registered successfully"){
            //Show success message 
            var alert = document.getElementById('alert');
            alert.style.display = 'block';
            alert.innerText = "User registered successfully";

            //clear form fields
            document.getElementById('fname').value = '';
            document.getElementById('lname').value = '';
            document.getElementById('email').value = '';
            document.getElementById('psw').value = '';
            document.getElementById('psw-confirm').value = '';
           

         }else if(data.error){
            //Show error message
            var alert = document.getElementById('alert');
            alert.style.display = 'block';
            alert.innerText = data.error;
         }
         
      })
      .catch((error) => {
         console.log('Error:', error);
         loader.style.display = 'none';
         alert('An error occurred. Please try again');
      });


});