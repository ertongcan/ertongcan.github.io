
import { FaceMesh } from "@mediapipe/face_mesh";

const SYMMETRIC_PAIRS = [
    [33, 263],   // outer eye corners
    [133, 362],  // inner eye corners
    [159, 386],  // upper eyelids
    [145, 374],  // lower eyelids
    [61, 291],   // mouth corners
    [70, 300],   // cheeks
];

    const faceMesh = new FaceMesh({
    locateFile: f =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
});

    faceMesh.setOptions({
    staticImageMode: true,
    maxNumFaces: 1,
    refineLandmarks: true,
});

    let pendingResolve = null;

    faceMesh.onResults(results => {
    if (!pendingResolve) return;
    pendingResolve(results);
    pendingResolve = null;
});

    async function processImage(img) {
    return new Promise(resolve => {
    pendingResolve = resolve;
    faceMesh.send({ image: img });
});
}

    document.getElementById("files").onchange = async e => {
    const output = [];

    for (const file of e.target.files) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        await img.decode();

        const results = await processImage(img);

        if (results.multiFaceLandmarks?.length) {
            const landmarks = results.multiFaceLandmarks[0];
            const score = symmetryScore(landmarks);
            output.push({ file: file.name, symmetry: score });
        } else {
            output.push({ file: file.name, symmetry: null });
        }

        URL.revokeObjectURL(url);
    }

    document.getElementById("out").textContent =
    JSON.stringify(output, null, 2);
};

/**
 * SYMMETRIC_PAIRS: These indices refer to specific MediaPipe landmarks.
 * 168 (Nose Bridge) and 6 (Between eyes) define the vertical axis of the face.
 */

function symmetryScore(landmarks) {
    const mid = faceMidline(landmarks);
    let total = 0;

    for (const [L, R] of SYMMETRIC_PAIRS) {
        const left = landmarks[L];
        const right = landmarks[R];

        // 1. Project the left point across the midline to see where it 'should' be
        const mirrored = mirrorPoint(left, mid);

        // 2. Calculate the 'Error Distance' between mirrored point and actual right point
        const d = Math.hypot(
            mirrored.x - right.x,
            mirrored.y - right.y
        );

        total += d;
    }

    // 3. Return the average error. Lower = More Symmetric.
    return total / SYMMETRIC_PAIRS.length;
}

function mirrorPoint(p, line) {
    const { x1, y1, x2, y2 } = line;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    const b = (2 * dx * dy) / (dx * dx + dy * dy);

    return {
        x: a * (p.x - x1) + b * (p.y - y1) + x1,
        y: b * (p.x - x1) - a * (p.y - y1) + y1,
    };
}

function faceMidline(landmarks) {
    const noseTop = landmarks[168];
    const noseBottom = landmarks[6];

    return {
        x1: noseTop.x,
        y1: noseTop.y,
        x2: noseBottom.x,
        y2: noseBottom.y,
    };
}

