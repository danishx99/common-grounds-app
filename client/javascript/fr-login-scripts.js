// facial recognition
// not linked to any frontend at all & needs to be linked to the backend
console.log(faceapi)

const run = async()=>{
    //we need to load our models using await


    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('../face-models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('../face-models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('../face-models'),
        faceapi.nets.ageGenderNet.loadFromUri('../face-models'),
    ])

    // get the email from the user
    const email = document.getElementById('email').value;

    // grab face & send data to detectFaces method

    const refImage= document.getElementById("image");// this is the image the user uploads 

    const facesToCheckImage = await fetchUserImageByEmail(email);

    let refImageAIData= await faceapi.detectAllFaces(refImage).withFaceLandmarks().withFaceDescriptors();
    let facesToCheckImageAIData= await faceapi.detectAllFaces(facesToCheckImage).withFaceLandmarks().withFaceDescriptors();

    // here we make a face matcher of the reference image & compare that to the face we want to check
    let faceMatcher= new faceapi.FaceMatcher(refImageAIData);
    facesToCheckImageAIData= faceapi.resizeResults(facesToCheckImageAIData, facesToCheckImage);
    

    //loop all faces in image to check & compare faces
    facesToCheckImageAIData.forEach(face=>{
        
        const {descriptor, detection}= face;

        // make a label using the default 
        let label= faceMatcher.findBestMatch(descriptor).toString();
        console.log(label);

        // If the face belongs to the person (not "unknown")
    if (!label.includes("unknown")) {
        // login user
        console.log("User logged in.");
        
    } else {
        alert('Face did not match. Please try again.');
    }
    })
    

}

run()

// fetch user image by email
// feel like there is a lot of redundant code here- check wit team
async function fetchUserImageByEmail(email) {

    try {
        await client.connect();
        const collection = client.db("test").collection("User");
        const userDoc = await collection.findOne({ email: email }, { projection: { profile_image: 1, _id: 0 } });
        return userDoc.profile_image; // Assuming profile_image is the field containing the image path
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        await client.close();
    }
}