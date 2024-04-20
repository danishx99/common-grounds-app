var submitButton = document.getElementById('submitButton');

submitButton.addEventListener('click', function(event) {
    event.preventDefault();

   console.log('Submit button clicked');

    // Validate form fields
    var email = document.getElementById('email').value;
    var password = document.getElementById('psw').value;


   if (!email || !password ) {
    var alert = document.getElementById('alert');
    alert.style.display = 'block';
    alert.innerText = "Please fill in all fields";
    return;
   }


   //show loader while waiting for response
   var loader = document.getElementById('loader');
   loader.style.display = 'flex';


   //post rqeuest to login user
   fetch('/api/auth/login', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        
         email: document.getElementById('email').value,
         password: document.getElementById('psw').value,
        
      }),
   })
      .then((response) => {
         return response.json();
      })
      .then((data) => {
         //console.log(data);
         //hide loader when response is received
         loader.style.display = 'none';

        if(data.error){
            //Show error message
            var alert = document.getElementById('alert');
            alert.style.display = 'block';
            alert.innerText = data.error;
        }else if(data.success){

            //Show success login message
            var alert = document.getElementById('alert');
            alert.style.display = 'block';
            alert.innerText ="You have successfully logged in";
        }
         
      })
      .catch((error) => {
         console.log('Error:', error);
         loader.style.display = 'none';
         alert('An error occurred. Please try again');
      });


});