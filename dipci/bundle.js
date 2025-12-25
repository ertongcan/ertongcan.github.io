/******/ (() => { // webpackBootstrap
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
const videoElement = document.getElementById('video-input');
const p1ScoreDiv = document.getElementById('p1-score');
const p2ScoreDiv = document.getElementById('p2-score');

const faceMesh = new FaceMesh({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});

faceMesh.setOptions({
    maxNumFaces: 2, // Enable two-player mode
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

function calculateImbalance(landmarks) {
    const anchor = landmarks[168]; // Nose Bridge
    const L = landmarks[133];      // Left Inner Eye
    const R = landmarks[362];      // Right Inner Eye

    const dist3D = (p1, p2) => Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
    );

    const dL = dist3D(anchor, L);
    const dR = dist3D(anchor, R);

    // Percent difference (Symmetry Score)
    return (Math.abs(dL - dR) / ((dL + dR) / 2)) * 100;
}

faceMesh.onResults(results => {
    // Reset scores if no one is detected
    p1ScoreDiv.innerText = "--%";
    p2ScoreDiv.innerText = "--%";

    if (results.multiFaceLandmarks) {
        results.multiFaceLandmarks.forEach((landmarks, index) => {
            const score = calculateImbalance(landmarks);
            const displayScore = score.toFixed(1) + "%";

            if (index === 0) {
                p1ScoreDiv.innerText = displayScore;
                document.getElementById('p1-card').classList.toggle('winner', score < 5);
            } else if (index === 1) {
                p2ScoreDiv.innerText = displayScore;
                document.getElementById('p2-card').classList.toggle('winner', score < 5);
            }
        });
    }
});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({image: videoElement});
    },
    width: 1280,
    height: 720
});
camera.start();

/******/ })()
;
//# sourceMappingURL=bundle.js.map