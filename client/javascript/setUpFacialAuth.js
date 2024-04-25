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
    console.log(photoDataUrl);
    });

    startWebcam();
});
