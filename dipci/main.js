
import { FaceMesh } from "@mediapipe/face_mesh";
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
