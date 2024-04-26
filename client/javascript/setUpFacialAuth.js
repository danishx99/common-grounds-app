document.addEventListener('DOMContentLoaded', (event) => {
    const video = document.getElementById('facialAuthVid');
    const captureButton = document.getElementById('captureButton');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');


    function startWebcam(){
        navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.log("An error occurred: " + err);
            var alert = document.getElementById("alert");
            alert.style.display = "block";
            alert.innerText = "An error occurred: " + err;
            alert.className ="bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
            var videoBox = document.getElementById("videoBox");
            videoBox.style.display = "none";
        });
    }

    captureButton.addEventListener('click', () => {
        // Dynamically set the canvas size to match the video's dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    
        // Now draw the video frame onto the canvas
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
        // Convert the canvas to a data URL for further use
        const photoDataUrl = canvas.toDataURL('image/png');
    
        // Function to convert data URL to Base64 string
        const getBase64StringFromDataURL = (dataURL) =>
            dataURL.replace('data:image/png;base64,', '');
    
        // Extract Base64 string from data URL
        const base64String = getBase64StringFromDataURL(photoDataUrl);
        console.log(base64String);

        var loader = document.getElementById("loader");
        loader.style.display = "flex";


        return;
        fetch("/api/auth/setUpFacialAuth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image: base64String,
            }),
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            loader.style.display = "none";

            if (data.message === "Facial authentication set up successfully") {
                //Show success message
                var alert = document.getElementById("alert");
                alert.style.display = "block";
                alert.innerText = "Facial authentication set up successfully";
                alert.className =
                    "bg-green-100 border hidden border-green-400 text-green-700 px-2 py-2 rounded-2xl text-center mb-[4%]";

                // redirect to login page
                setTimeout(() => {
                    window.location.href = "/login";
                }, 5000);
            } else if (data.error) {
                //Show error message
                var alert = document.getElementById("alert");
                alert.style.display = "block";
                alert.innerText = data.error;
                alert.className =
                    "bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
            }
        })
        .catch((err) => {
            console.log("An error occurred: " + err);
            var alert = document.getElementById("alert");
            loader.style.display = "none";
            alert.style.display = "block";
            alert.innerText = "An error occurred: " + err;
            alert.className ="bg-red-100 border hidden border-red-400 text-red-700 px-2 py-2 rounded-2xl text-center mb-[4%]";
        });
    });

    startWebcam();
});
