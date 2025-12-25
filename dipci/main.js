import { FaceMesh } from "@mediapipe/face_mesh";

function checkBilateralDepth(landmarks) {
    const anchor = landmarks[168]; // Nose Bridge
    const leftEye = landmarks[133];
    const rightEye = landmarks[362];

    // Calculate 3D Euclidean Distance: sqrt(dx² + dy² + dz²)
    const get3DDist = (p1, p2) => Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );

    const distL = get3DDist(anchor, leftEye);
    const distR = get3DDist(anchor, rightEye);

    // The "Imbalance Score" is the percentage difference
    const imbalance = Math.abs(distL - distR) / ((distL + distR) / 2);

    // Threshold: Real human faces (even with tilt) usually stay under 0.05
    // Deepfakes or bad AI swaps often spike above 0.12
    return {
        score: imbalance,
        isSuspect: imbalance > 0.08
    };
}

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

document.getElementById("files").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const results = await new Promise(resolve => {
        resolveResult = resolve;
        faceMesh.send({ image: img });
    });

    const out = document.getElementById("out");
    if (results.multiFaceLandmarks?.length) {
        const forensic = checkBilateralDepth(results.multiFaceLandmarks[0]);

        out.innerHTML = `
            <div style="color: ${forensic.isSuspect ? '#ff4444' : '#00ff88'}">
                <h3>${forensic.isSuspect ? '⚠️ SUSPECT GEOMETRY' : '✅ GEOMETRY STABLE'}</h3>
                <p>Depth Imbalance: ${(forensic.score * 100).toFixed(2)}%</p>
            </div>
        `;
    } else {
        out.innerText = "No face detected.";
    }
};
