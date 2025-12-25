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
const sounds = {
    nose: new Audio('sounds/nose_kid.mp3'),
    eye: new Audio('sounds/eye_kid.mp3'),
    lips: new Audio('sounds/lips_kid.mp3'),
    ear: new Audio('sounds/ear_kid.mp3')
};
function playKidVoice(part) {
    if (lastPlayed === part || cooldown) return;

    // Reset and play
    //sounds[part].currentTime = 0;
    //sounds[part].play();

    statusDiv.innerText = `That's your ${part.toUpperCase()}! ✨`;
    lastPlayed = part;
    cooldown = true;

    // 1.5 second cooldown so it doesn't repeat too fast
    setTimeout(() => { cooldown = false; }, 1500);
}

async function predict() {
    const now = performance.now();
    const faceRes = faceLandmarker.detectForVideo(video, now);
    const handRes = handLandmarker.detectForVideo(video, now);

    if (faceRes.faceLandmarks?.[0] && handRes.landmarks?.[0]) {
        const face = faceRes.faceLandmarks[0];
        const finger = handRes.landmarks[0][8]; // Index finger tip

        // Check distances to Hotzones
        const dist = (target) => Math.hypot(target.x - finger.x, target.y - finger.y, target.z - finger.z);

        if (dist(face[1]) < 0.05) playKidVoice("nose");
        else if (dist(face[159]) < 0.05 || dist(face[386]) < 0.05) playKidVoice("eye");
        else if (dist(face[13]) < 0.05) playKidVoice("lips");
        else if (dist(face[234]) < 0.05 || dist(face[454]) < 0.05) playKidVoice("ear");
        else {
            statusDiv.innerText = "Point to your face!";
            lastPlayed = ""; // Reset if finger moves away
        }
    }
    requestAnimationFrame(predict);
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
