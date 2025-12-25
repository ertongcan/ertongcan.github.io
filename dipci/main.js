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

let lastPlayed = "";
let cooldown = false;
// Audio setup (ensure these files are in your folder)

// Add these to your state management at the top
let isPlaying = false;

async function predict() {
    const now = performance.now();
    const faceRes = faceLandmarker.detectForVideo(video, now);
    const handRes = handLandmarker.detectForVideo(video, now);

    if (faceRes.faceLandmarks?.[0] && handRes.landmarks?.[0]) {
        const face = faceRes.faceLandmarks[0];
        const finger = handRes.landmarks[0][8];

        const dist = (target) => Math.hypot(target.x - finger.x, target.y - finger.y, target.z - finger.z);

        // 1. Identify which part is being touched (if any)
        let currentPart = null;
        if (dist(face[1]) < 0.06) currentPart = "nose";
        else if (dist(face[159]) < 0.06 || dist(face[386]) < 0.06) currentPart = "eye";
        else if (dist(face[13]) < 0.06) currentPart = "lips";
        else if (dist(face[234]) < 0.07 || dist(face[454]) < 0.07) currentPart = "ear";

        // 2. Interaction Logic
        if (currentPart) {
            // Only trigger if we aren't already playing this specific part's sound
            if (lastPlayed !== currentPart && !isPlaying) {
                triggerInteraction(currentPart);
            }
        } else {
            // Finger is not touching anything
            statusDiv.innerText = "Can you find your nose? 👉";
            lastPlayed = ""; // Clear the memory so they can touch the same part again
        }
    }
    requestAnimationFrame(predict);
}

function triggerInteraction(part) {
    isPlaying = true;
    lastPlayed = part;

    statusDiv.innerText = `BOOP! That's your ${part.toUpperCase()}! 🎈`;
    statusDiv.style.transform = "scale(1.2)";

    // Play sound
    // sounds[part].currentTime = 0;
    // sounds[part].play();

    // Reset visual/state after a short delay
    setTimeout(() => {
        statusDiv.style.transform = "scale(1.0)";
        isPlaying = false;
    }, 1000); // 1 second "lock" to prevent sound stuttering
}

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



function startLoop() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predict);
    });
}

initializeModels();
