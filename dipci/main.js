import { FaceMesh } from "@mediapipe/face_mesh";

const faceMesh = new FaceMesh({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
});

faceMesh.setOptions({
    staticImageMode: true, // Optimized for individual files
    maxNumFaces: 1,
    refineLandmarks: true
});

let resolveResult = null;
faceMesh.onResults(results => {
    if (resolveResult) resolveResult(results);
});

async function processImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();

    const results = await new Promise(resolve => {
        resolveResult = resolve;
        faceMesh.send({ image: img });
    });

    URL.revokeObjectURL(url);
    return results.multiFaceLandmarks?.[0] || null;
}

// Logic for drift/symmetry
function analyzeBatch(landmarksArray) {
    let drifts = [];

    // Compare each frame to the one before it in the selection
    for (let i = 1; i < landmarksArray.length; i++) {
        const current = landmarksArray[i];
        const prev = landmarksArray[i-1];

        const anchor = current[168];
        const prevAnchor = prev[168];
        let totalDrift = 0;
        const checkpoints = [33, 263, 61, 291];

        checkpoints.forEach(idx => {
            const currentVec = { x: current[idx].x - anchor.x, y: current[idx].y - anchor.y };
            const prevVec = { x: prev[idx].x - prevAnchor.x, y: prev[idx].y - prevAnchor.y };
            totalDrift += Math.hypot(currentVec.x - prevVec.x, currentVec.y - prevVec.y);
        });
        drifts.push(totalDrift / checkpoints.length);
    }
    return drifts;
}

document.getElementById("files").onchange = async (e) => {
    const files = Array.from(e.target.files);
    const outputDiv = document.getElementById("out");
    outputDiv.innerHTML = "Processing frames... please wait.";

    let allLandmarks = [];

    for (const file of files) {
        const landmarks = await processImage(file);
        if (landmarks) allLandmarks.push(landmarks);
    }

    const drifts = analyzeBatch(allLandmarks);
    const avgDrift = drifts.length > 0 ? drifts.reduce((a, b) => a + b, 0) / drifts.length : 0;
    const isFake = avgDrift > 0.004;

    // Final Display Logic
    outputDiv.innerHTML = `
        <div style="font-size: 1.2rem; margin-bottom: 1rem;">
            Verdict: <span class="${isFake ? 'fake' : 'genuine'}">${isFake ? 'DEEPFAKE DETECTED' : 'LIKELY GENUINE'}</span>
        </div>
        <div>Avg Structural Drift: ${(avgDrift * 1000).toFixed(4)}</div>
        <hr>
        <small>Analyzed ${allLandmarks.length} frames. Higher drift suggests AI-generated temporal instability.</small>
    `;
};
