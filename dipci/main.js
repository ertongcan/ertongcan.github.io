import { FaceMesh } from "@mediapipe/face_mesh";

const faceMesh = new FaceMesh({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
});

faceMesh.setOptions({
    staticImageMode: true,
    maxNumFaces: 1,
    refineLandmarks: true
});

let resolveResult = null;
faceMesh.onResults(results => {
    if (resolveResult) resolveResult(results);
});

// Single Image Analysis Logic
function analyzeSingleImage(landmarks) {
    // Anchor: Nose Bridge (168)
    const anchor = landmarks[168];

    console.log(anchor);

    // Measure Symmetry: Distance from nose to inner eye corners
    const leftEye = landmarks[133];
    const rightEye = landmarks[362];

    const distL = Math.hypot(leftEye.x - anchor.x, leftEye.y - anchor.y);
    const distR = Math.hypot(rightEye.x - anchor.x, rightEye.y - anchor.y);

    // Structural Ratio: How much the left/right balance deviates
    const symmetryError = Math.abs(distL - distR);

    // Verdict: Deepfakes often have "warped" symmetry in static photos
    // A threshold over 0.015 usually indicates head tilt OR AI distortion
    const isSuspect = symmetryError > 0.015;

    return {
        score: (symmetryError * 1000).toFixed(2),
        verdict: isSuspect ? "SUSPECT (Geometric Anomaly)" : "LIKELY GENUINE"
    };
}

document.getElementById("files").onchange = async (e) => {
    const file = e.target.files[0]; // Take only the first photo
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();

    const results = await new Promise(resolve => {
        resolveResult = resolve;
        faceMesh.send({ image: img });
    });

    const outputDiv = document.getElementById("out");
    if (results.multiFaceLandmarks?.length) {
        const analysis = analyzeSingleImage(results.multiFaceLandmarks[0]);
        outputDiv.innerHTML = `
            <h3 style="color: ${analysis.verdict.includes('SUSPECT') ? '#ff4444' : '#44ff44'}">
                ${analysis.verdict}
            </h3>
            <p>Symmetry Error: ${analysis.score}</p>
        `;
    } else {
        outputDiv.innerHTML = "No face detected in this image.";
    }

    URL.revokeObjectURL(url);
};
