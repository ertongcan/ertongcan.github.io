/******/ (() => { // webpackBootstrap
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
const videoElement = document.getElementById('video-input');
const scoreDisplay = document.getElementById('score-display');
const statusText = document.getElementById('status-text');

// 1. Setup Face Mesh
const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 2. The Symmetry Math
function calculateSymmetry(landmarks) {
    const bridge = landmarks[168]; // Stable Anchor
    const eyeL = landmarks[133];
    const eyeR = landmarks[362];

    const dist3D = (p1, p2) => Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
    );

    const dL = dist3D(bridge, eyeL);
    const dR = dist3D(bridge, eyeR);

    // Percentage of imbalance
    const imbalance = (Math.abs(dL - dR) / ((dL + dR) / 2)) * 100;
    return imbalance;
}

// 3. Handle Results
faceMesh.onResults(results => {
    if (results.multiFaceLandmarks?.length > 0) {
        const score = calculateSymmetry(results.multiFaceLandmarks[0]);
        scoreDisplay.innerText = score.toFixed(1) + "%";

        if (score < 5) {
            statusText.innerText = "VERDICT: HIGH STABILITY (REAL)";
            scoreDisplay.style.color = "#22c55e"; // Green
        } else if (score < 10) {
            statusText.innerText = "VERDICT: MODERATE ASYMMETRY";
            scoreDisplay.style.color = "#eab308"; // Yellow
        } else {
            statusText.innerText = "VERDICT: SUSPECT GEOMETRY (AI?)";
            scoreDisplay.style.color = "#ef4444"; // Red
        }
    } else {
        scoreDisplay.innerText = "--%";
        statusText.innerText = "NO FACE DETECTED";
    }
});

// 4. Start Camera
const camera = new Camera(videoElement, {
    onFrame: async () => await faceMesh.send({image: videoElement}),
    width: 1280, height: 720
});
camera.start();

/******/ })()
;
//# sourceMappingURL=bundle.js.map