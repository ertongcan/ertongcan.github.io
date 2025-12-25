/******/ (() => { // webpackBootstrap
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
const videoElement = document.getElementById('video-input');
const p1Card = document.getElementById('p1-card');
const p2Card = document.getElementById('p2-card');
const p1Score = document.getElementById('p1-score');
const p2Score = document.getElementById('p2-score');

const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});

faceMesh.setOptions({
    maxNumFaces: 2, // Crucial for Duel
    refineLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

// Forensic calculation function
function getForensicScore(face) {
    const bridge = face[168]; // Nose bridge anchor
    const eyeL = face[133];   // Inner Left
    const eyeR = face[362];   // Inner Right

    const dist3D = (a, b) => Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z);

    const leftSide = dist3D(bridge, eyeL);
    const rightSide = dist3D(bridge, eyeR);

    // Calculate percentage difference
    const ratio = Math.abs(leftSide - rightSide) / ((leftSide + rightSide) / 2);
    return ratio * 100;
}

faceMesh.onResults(results => {
    // Clear display if no one is found
    p1Score.innerText = "--%"; p2Score.innerText = "--%";
    p1Card.className = "player-card"; p2Card.className = "player-card";

    if (results.multiFaceLandmarks?.length > 0) {
        // Sort faces by X position so Player 1 is always the left-most person on screen
        const sortedFaces = [...results.multiFaceLandmarks].sort((a, b) => a[1].x - b[1].x);

        sortedFaces.forEach((face, i) => {
            const imbalance = getForensicScore(face);
            const scoreText = imbalance.toFixed(1) + "%";

            // Map face to UI (P1 = Left, P2 = Right)
            if (i === 0) {
                p1Score.innerText = scoreText;
                if (imbalance < 6) p1Card.classList.add('winner'); // Threshold for "Very Real"
            } else if (i === 1) {
                p2Score.innerText = scoreText;
                if (imbalance < 6) p2Card.classList.add('winner');
            }
        });
    }
});

const camera = new Camera(videoElement, {
    onFrame: async () => await faceMesh.send({image: videoElement}),
    width: 960, height: 540
});
camera.start();

/******/ })()
;
//# sourceMappingURL=bundle.js.map