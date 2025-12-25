import { FaceMesh } from "@mediapipe/face_mesh";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const videoElement = document.getElementById('input_video');
const statusDiv = document.getElementById('status');

// 1. Initialize Models
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true });
hands.setOptions({ maxNumHands: 1, minDetectionConfidence: 0.7 });

// 2. Shared Data State
let faceLandmarks = null;
let handLandmarks = null;

faceMesh.onResults((results) => {
    faceLandmarks = results.multiFaceLandmarks?.[0];
});

hands.onResults((results) => {
    handLandmarks = results.multiHandLandmarks?.[0];
    statusDiv.innerText = handLandmarks;
});

// 3. The Forensic Detection Loop
function checkProximity() {
    if (faceLandmarks && handLandmarks) {
        const noseTip = faceLandmarks[1];        // Index 1: Nose Tip
        const indexTip = handLandmarks[8];       // Index 8: Index Finger Tip

        // 3D Distance Calculation
        const distance = Math.sqrt(
            Math.pow(noseTip.x - indexTip.x, 2) +
            Math.pow(noseTip.y - indexTip.y, 2) +
            Math.pow(noseTip.z - indexTip.z, 2)
        );

        // Threshold: 0.07 is usually the "sweet spot" for a touch
        if (distance < 0.07) {
            statusDiv.innerText = "👃 NOSE TOUCHED!";
            statusDiv.classList.add('success');
        } else {
            statusDiv.innerText = "Target: Your Nose";
            statusDiv.classList.remove('success');
        }
    } else {
        statusDiv.innerText = "Show your face and hand";
    }
}

// 4. Integrated Camera Loop
const camera = new Camera(videoElement, {
    onFrame: async () => {
        // Process both in the same frame
        await faceMesh.send({image: videoElement});
        await hands.send({image: videoElement});
        checkProximity();
    },
    width: 640,
    height: 480
});

camera.start();
