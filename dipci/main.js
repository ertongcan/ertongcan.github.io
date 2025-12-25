// Import the modern Task Vision classes
import {
    FaceLandmarker,
    HandLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

const video = document.getElementById("webcam");
const statusDiv = document.getElementById("status");

let faceLandmarker;
let handLandmarker;
let lastVideoTime = -1;

/**
 * Initialize the "Tasks Vision" models
 */
async function initializeModels() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    // Initialize Face Landmarker (The modern FaceMesh)
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO"
    });

    // Initialize Hand Landmarker
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
    });

    statusDiv.innerText = "Models Ready!";
    startLoop();
}

/**
 * The Detection Loop for Nose-Touch Logic
 */
async function predict() {
    const startTimeMs = performance.now();

    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        const faceRes = faceLandmarker.detectForVideo(video, startTimeMs);
        const handRes = handLandmarker.detectForVideo(video, startTimeMs);

        if (faceRes.faceLandmarks?.[0] && handRes.landmarks?.[0]) {
            const nose = faceRes.faceLandmarks[0][1]; // Index 1: Nose Tip
            const finger = handRes.landmarks[0][8];   // Index 8: Index Finger Tip

            // Math: 3D Euclidean distance
            const distance = Math.hypot(
                nose.x - finger.x,
                nose.y - finger.y,
                nose.z - finger.z
            );

            // Threshold check (0.07 is ideal for 'touching')
            if (distance < 0.07) {
                statusDiv.innerText = "👃 NOSE TOUCHED!";
                statusDiv.style.color = "yellow";
            } else {
                statusDiv.innerText = "Target: Your Nose";
                statusDiv.style.color = "white";
            }
        }
    }
    requestAnimationFrame(predict);
}

function startLoop() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict);
    });
}

initializeModels();
