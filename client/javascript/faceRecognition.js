// define onclick listener for the button


// send the payload to api/auth/registerFace 

// var config = require('./config');
const dotenv = require("dotenv"); // For accessing environment variables
var http = require('http');
var https = require('https');


module.exports = {
    /**
     * Call MS face detection
     * 
     * @param {*} imageData image as dataURL
     * @param {*} onSuccess success callback
     * @param {*} onError error callback
     */
	detect: function(image, onSuccess, onError) {
        var msDetectOptions = {
            host: dotenv.FACE_API_HOST,
            method: 'POST',
            port: 443,
            path: dotenv.FACE_API_PATH_DETECT,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': Buffer.byteLength(image),
                'Ocp-Apim-Subscription-Key': dotenv.FACE_API_KEY
            }
        };

        var msDetectReq = https.request(msDetectOptions, function(msDetectResponse) {
            msDetectResponse.setEncoding('utf8');
            msDetectResponse.on('data', function(msDetectData){
                var data = JSON.parse(msDetectData);
                if(msDetectData.error){
                    onError(data);
                }
                else {
                    onSuccess(data);
                }
            });
        });

        msDetectReq.on('error', onError);
        msDetectReq.write(image);
        msDetectReq.end();
    },

    // Call MS face verification
    /**
     * 
     * @param {*} faceId1 face1 to compare
     * @param {*} faceId2 face2 to compare
     * @param {*} onSuccess success callback
     * @param {*} onError error callback
     */
    verify: function(faceId1, faceId2, onSuccess, onError) {
        var msVerifyOptions = {
            host: dotenv.FACE_API_HOST,
            method: 'POST',
            port: 443,
            path: dotenv.FACE_API_PATH_VERIFY,
            headers: {
                'Ocp-Apim-Subscription-Key': dotenv.FACE_API_KEY
            }
        }

        var msVerifyReq = https.request(msVerifyOptions, function(msVerifyResponse) {
            msVerifyResponse.setEncoding('utf8');
            msVerifyResponse.on('data', function(msVerifyData) {
                onSuccess(JSON.parse(msVerifyData));
            });
        })

        msVerifyReq.on('error', onError);
        msVerifyReq.write(JSON.stringify({faceId1: faceId1, faceId2: faceId2}));
        msVerifyReq.end();
    }
};