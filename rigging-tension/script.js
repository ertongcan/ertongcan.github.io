let config = {
    load: 1000,
    bridleType: 2,
    angle1: 30,
    angle2: 30,
    angle3: 30,
    angle4: 30,
    unit: 'kg'
};

let telemetry = {
    t1: 0,
    t2: 0,
    t3: 0,
    t4: 0,
    sf: 5,
    liveLoad: 1000,
    liveAngle1: 30,
    liveAngle2: 30,
    liveAngle3: 30,
    liveAngle4: 30
};

let simActive = false;
let activeDeviceLeg = 0; // 0=none, 1=leg1, 2=leg2
let time = 0;

// DOM Elements
const els = {
    bridleType: document.getElementById('bridle-type'),
    loadIn: document.getElementById('load-weight'),
    a1In: document.getElementById('angle-1'),
    a2In: document.getElementById('angle-2'),
    a3In: document.getElementById('angle-3'),
    a4In: document.getElementById('angle-4'),
    loadVal: document.getElementById('load-val'),
    a1Val: document.getElementById('a1-val'),
    a2Val: document.getElementById('a2-val'),
    a3Val: document.getElementById('a3-val'),
    a4Val: document.getElementById('a4-val'),

    ctrl3: document.getElementById('leg-3-ctrl'),
    ctrl4: document.getElementById('leg-4-ctrl'),

    liveLoad: document.getElementById('live-load'),
    liveT1: document.getElementById('live-t1'),
    liveT2: document.getElementById('live-t2'),
    liveT3: document.getElementById('live-t3'),
    liveT4: document.getElementById('live-t4'),
    sf: document.getElementById('safety-factor'),

    t1Display: document.getElementById('t1-display'),
    t2Display: document.getElementById('t2-display'),
    t3Display: document.getElementById('t3-display'),
    t4Display: document.getElementById('t4-display'),
    t1Pill: document.getElementById('t1-pill'),
    t2Pill: document.getElementById('t2-pill'),
    t3Pill: document.getElementById('t3-pill'),
    t4Pill: document.getElementById('t4-pill'),

    rowT3: document.getElementById('row-t3'),
    rowT4: document.getElementById('row-t4'),

    btnSim: document.getElementById('toggle-sim'),
    btnDevice1: document.getElementById('btn-device-1'),
    btnDevice2: document.getElementById('btn-device-2'),
    btnDevice3: document.getElementById('btn-device-3'),
    btnDevice4: document.getElementById('btn-device-4'),
    btnUnit: document.getElementById('toggle-unit'),
    sensorStatus: document.getElementById('sensor-status'),
    sensorText: document.getElementById('sensor-text'),
    logList: document.getElementById('log-list'),

    canvas: document.getElementById('vector-canvas')
};

const ctx = els.canvas.getContext('2d');

// Initialize event listeners
function init() {
    els.bridleType.addEventListener('change', handleBridleChange);
    els.loadIn.addEventListener('input', (e) => { config.load = parseFloat(e.target.value); updateUI(); });
    els.a1In.addEventListener('input', (e) => { config.angle1 = parseFloat(e.target.value); updateUI(); });
    els.a2In.addEventListener('input', (e) => { config.angle2 = parseFloat(e.target.value); updateUI(); });
    els.a3In.addEventListener('input', (e) => { config.angle3 = parseFloat(e.target.value); updateUI(); });
    els.a4In.addEventListener('input', (e) => { config.angle4 = parseFloat(e.target.value); updateUI(); });

    els.btnSim.addEventListener('click', toggleSim);
    els.btnDevice1.addEventListener('click', () => toggleDeviceAngle(1));
    els.btnDevice2.addEventListener('click', () => toggleDeviceAngle(2));
    els.btnDevice3.addEventListener('click', () => toggleDeviceAngle(3));
    els.btnDevice4.addEventListener('click', () => toggleDeviceAngle(4));
    els.btnUnit.addEventListener('click', toggleUnit);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    requestAnimationFrame(loop);
}

function handleBridleChange(e) {
    config.bridleType = parseInt(e.target.value);

    // Toggle UI visibility
    els.ctrl3.style.display = config.bridleType >= 3 ? 'flex' : 'none';
    els.ctrl4.style.display = config.bridleType >= 4 ? 'flex' : 'none';

    els.btnDevice3.style.display = config.bridleType >= 3 ? 'block' : 'none';
    els.btnDevice4.style.display = config.bridleType >= 4 ? 'block' : 'none';

    els.t3Pill.style.display = config.bridleType >= 3 ? 'flex' : 'none';
    els.t4Pill.style.display = config.bridleType >= 4 ? 'flex' : 'none';

    els.rowT3.style.display = config.bridleType >= 3 ? 'flex' : 'none';
    els.rowT4.style.display = config.bridleType >= 4 ? 'flex' : 'none';

    // Auto-disable unneeded device orientations
    if (config.bridleType < 4 && activeDeviceLeg === 4) toggleDeviceAngle(4);
    if (config.bridleType < 3 && activeDeviceLeg === 3) toggleDeviceAngle(3);

    updateUI();
}

function updateUI() {
    if (!simActive) telemetry.liveLoad = config.load;
    if (activeDeviceLeg !== 1) telemetry.liveAngle1 = config.angle1;
    if (activeDeviceLeg !== 2) telemetry.liveAngle2 = config.angle2;
    if (activeDeviceLeg !== 3) telemetry.liveAngle3 = config.angle3;
    if (activeDeviceLeg !== 4) telemetry.liveAngle4 = config.angle4;

    els.loadVal.textContent = config.load.toFixed(0);
    els.a1Val.textContent = config.angle1.toFixed(0);
    els.a2Val.textContent = config.angle2.toFixed(0);
    els.a3Val.textContent = config.angle3.toFixed(0);
    els.a4Val.textContent = config.angle4.toFixed(0);
}

function toggleSim() {
    simActive = !simActive;
    els.btnSim.classList.toggle('active', simActive);
    updateSensorStatus();
    log(`Load simulation ${simActive ? 'started' : 'stopped'}`);
}

function toggleUnit() {
    const isToLbs = config.unit === 'kg';
    const conversionFactor = 2.20462262185;

    if (isToLbs) {
        config.unit = 'lbs';
        config.load = config.load * conversionFactor;
        els.loadIn.max = "11000"; // roughly 5000kg max
    } else {
        config.unit = 'kg';
        config.load = config.load / conversionFactor;
        els.loadIn.max = "5000";
    }

    // Update Slider Value
    els.loadIn.value = config.load;

    els.btnUnit.textContent = `Switch to ${config.unit === 'kg' ? 'LBS' : 'KG'}`;
    els.btnUnit.classList.toggle('active', config.unit === 'lbs');

    document.querySelectorAll('.unit-label').forEach(el => {
        el.textContent = config.unit;
    });

    updateUI();
    // Force a telemetry calculation so the canvas and sidebar instantly show the converted math
    calculateTension();
    updateDOM();
}

function toggleDeviceAngle(leg) {
    if (activeDeviceLeg === leg) {
        activeDeviceLeg = 0;
        updateDeviceButtons();
        window.removeEventListener('deviceorientation', handleOrientation);
        updateSensorStatus();
        log(`Device tracking disabled`);
        return;
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        if (activeDeviceLeg === 0) {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        activateDeviceLeg(leg);
                    } else {
                        log("Device orientation permission denied");
                    }
                })
                .catch(console.error);
        } else {
            activateDeviceLeg(leg);
        }
    } else {
        activateDeviceLeg(leg);
    }
}

function activateDeviceLeg(leg) {
    const wasActive = activeDeviceLeg !== 0;
    activeDeviceLeg = leg;
    updateDeviceButtons();
    updateSensorStatus();
    log(`Tracking Leg ${leg} angle`);

    if (!wasActive) {
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

function updateDeviceButtons() {
    els.btnDevice1.classList.toggle('active', activeDeviceLeg === 1);
    els.btnDevice2.classList.toggle('active', activeDeviceLeg === 2);
    els.btnDevice3.classList.toggle('active', activeDeviceLeg === 3);
    els.btnDevice4.classList.toggle('active', activeDeviceLeg === 4);
}

function handleOrientation(event) {
    if (activeDeviceLeg === 0) return;
    let tilt = event.gamma || 0;
    let adjustedAngle = Math.abs(tilt);
    if (adjustedAngle > 89) adjustedAngle = 89;

    if (activeDeviceLeg === 1) {
        telemetry.liveAngle1 = adjustedAngle;
        config.angle1 = adjustedAngle;
        els.a1In.value = adjustedAngle;
    } else if (activeDeviceLeg === 2) {
        telemetry.liveAngle2 = adjustedAngle;
        config.angle2 = adjustedAngle;
        els.a2In.value = adjustedAngle;
    } else if (activeDeviceLeg === 3) {
        telemetry.liveAngle3 = adjustedAngle;
        config.angle3 = adjustedAngle;
        els.a3In.value = adjustedAngle;
    } else if (activeDeviceLeg === 4) {
        telemetry.liveAngle4 = adjustedAngle;
        config.angle4 = adjustedAngle;
        els.a4In.value = adjustedAngle;
    }
    updateUI();
}

function updateSensorStatus() {
    const active = simActive || activeDeviceLeg !== 0;
    els.sensorStatus.classList.toggle('active', active);
    els.sensorText.textContent = `Sensors: ${active ? 'ACTIVE' : 'INACTIVE'}`;
}

function log(message) {
    const li = document.createElement('li');
    const d = new Date();
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    li.innerHTML = `<span class="time">[${timeStr}]</span> ${message}`;
    els.logList.appendChild(li);
    els.logList.scrollTop = els.logList.scrollHeight;

    // Keep max 20 logs
    if (els.logList.children.length > 20) {
        els.logList.removeChild(els.logList.firstChild);
    }
}

function calculateTension() {
    const w = telemetry.liveLoad;
    const a1Rad = telemetry.liveAngle1 * Math.PI / 180;
    const a2Rad = telemetry.liveAngle2 * Math.PI / 180;
    const a3Rad = telemetry.liveAngle3 * Math.PI / 180;
    const a4Rad = telemetry.liveAngle4 * Math.PI / 180;

    telemetry.t3 = 0;
    telemetry.t4 = 0;

    if (config.bridleType === 2) {
        // T1 * sin(A1) = T2 * sin(A2) -> Horizontal equilibrium
        // T1 * cos(A1) + T2 * cos(A2) = W -> Vertical equilibrium
        const denom = Math.sin(a1Rad + a2Rad);
        if (denom < 0.001) {
            telemetry.t1 = w / 2;
            telemetry.t2 = w / 2;
        } else {
            telemetry.t1 = (w * Math.sin(a2Rad)) / denom;
            telemetry.t2 = (w * Math.sin(a1Rad)) / denom;
        }
    } else if (config.bridleType === 3) {
        // Assuming 3 points evenly spaced horizontally (120 degrees apart)
        // With symmetry in horizontal spacing, tension on a leg only depends on its vertical angle component.
        // Quick approximation for static equilibrium: Load is shared inversely proportional to their vertical distance contribution
        // T_i = W_{share_i} / cos(A_i). 
        // For a more physically robust solution without exact distances, assuming load perfectly centers via CG:
        // Weight distributed to leg i = W * (1/cos(Ai)) / Sum_j(1/cos(Aj))
        // This distributes load roughly evenly if angles are identical, but penalizes steeper angles.

        let c1 = Math.max(0.01, Math.cos(a1Rad));
        let c2 = Math.max(0.01, Math.cos(a2Rad));
        let c3 = Math.max(0.01, Math.cos(a3Rad));

        let sumC = (1 / c1) + (1 / c2) + (1 / c3);

        // Distribute load proportion
        let w1 = w * (1 / c1) / sumC;
        let w2 = w * (1 / c2) / sumC;
        let w3 = w * (1 / c3) / sumC;

        // Final tension is leg load divided by vertical angle
        telemetry.t1 = w1 / c1;
        telemetry.t2 = w2 / c2;
        telemetry.t3 = w3 / c3;

    } else if (config.bridleType === 4) {
        // Assuming 4 points perfectly square (90 degrees apart)
        let c1 = Math.max(0.01, Math.cos(a1Rad));
        let c2 = Math.max(0.01, Math.cos(a2Rad));
        let c3 = Math.max(0.01, Math.cos(a3Rad));
        let c4 = Math.max(0.01, Math.cos(a4Rad));

        let sumC = (1 / c1) + (1 / c2) + (1 / c3) + (1 / c4);

        let w1 = w * (1 / c1) / sumC;
        let w2 = w * (1 / c2) / sumC;
        let w3 = w * (1 / c3) / sumC;
        let w4 = w * (1 / c4) / sumC;

        telemetry.t1 = w1 / c1;
        telemetry.t2 = w2 / c2;
        telemetry.t3 = w3 / c3;
        telemetry.t4 = w4 / c4;
    }

    const maxTension = Math.max(telemetry.t1, telemetry.t2, telemetry.t3, telemetry.t4);

    // Safety Factor = Total User Load Capacity / Max Leg Tension
    telemetry.sf = maxTension > 0 ? config.load / maxTension : 99.9;
}

function resizeCanvas() {
    const rect = els.canvas.parentElement.getBoundingClientRect();
    els.canvas.width = rect.width;
    els.canvas.height = rect.height;
}

function draw() {
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);

    const w = els.canvas.width;
    const h = els.canvas.height;

    const originX = w / 2;
    const originY = 50;

    const loadY = h - 100; // Y pos of the load
    const bridleHeight = loadY - originY;

    const a1Rad = telemetry.liveAngle1 * Math.PI / 180;
    const a2Rad = telemetry.liveAngle2 * Math.PI / 180;

    // Calculate anchor points based on load position serving as the connection point
    // Wait, typical bridle: Load is at bottom (loadX, loadY). 
    // Anchors are at top (anchor1X, originY) and (anchor2X, originY).
    const loadX = w / 2;

    const leg1Length = bridleHeight / Math.cos(a1Rad);
    const leg2Length = bridleHeight / Math.cos(a2Rad);

    const anchor1X = loadX - (bridleHeight * Math.tan(a1Rad));
    const anchor2X = loadX + (bridleHeight * Math.tan(a2Rad));

    // Draw Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
    for (let i = 0; i < h; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }

    // Draw Centerline
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(loadX, originY);
    ctx.lineTo(loadX, loadY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Define Colors
    const primaryStr = '#00f0ff';
    const secondaryStr = '#ff0055';
    const tertiaryStr = '#ffb800';
    const quaternaryStr = '#b000ff';

    // Draw Leg 1
    ctx.beginPath();
    ctx.moveTo(anchor1X, originY);
    ctx.lineTo(loadX, loadY);
    const pulse1 = simActive ? 1 + Math.sin(time * 5) * 0.2 : 1;
    ctx.lineWidth = Math.min(10, Math.max(2, (telemetry.t1 / 1000) * 2)) * pulse1;
    ctx.strokeStyle = primaryStr;
    ctx.shadowColor = primaryStr;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Leg 2
    ctx.beginPath();
    ctx.moveTo(anchor2X, originY);
    ctx.lineTo(loadX, loadY);
    const pulse2 = simActive ? 1 + Math.cos(time * 5.2) * 0.2 : 1;
    ctx.lineWidth = Math.min(10, Math.max(2, (telemetry.t2 / 1000) * 2)) * pulse2;
    ctx.strokeStyle = secondaryStr;
    ctx.shadowColor = secondaryStr;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Leg 3
    if (config.bridleType >= 3) {
        // Pseudo-isometric projection for drawing 3rd leg wrapping "behind"
        const anchor3X = loadX;
        const anchor3Y = originY - 30; // visually push back
        ctx.beginPath();
        ctx.moveTo(anchor3X, anchor3Y);
        ctx.lineTo(loadX, loadY);
        const pulse3 = simActive ? 1 + Math.sin(time * 4) * 0.2 : 1;
        ctx.lineWidth = Math.min(10, Math.max(2, (telemetry.t3 / 1000) * 2)) * pulse3;
        ctx.strokeStyle = tertiaryStr;
        ctx.shadowColor = tertiaryStr;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(anchor3X, anchor3Y, 6, 0, Math.PI * 2); ctx.fill();
    }

    // Draw Leg 4
    if (config.bridleType >= 4) {
        // Pseudo-isometric projection for drawing 4th leg coming "forward"
        const anchor4X = loadX;
        const anchor4Y = originY + 50; // visually pull forward
        ctx.beginPath();
        ctx.moveTo(anchor4X, anchor4Y);
        ctx.lineTo(loadX, loadY);
        const pulse4 = simActive ? 1 + Math.cos(time * 4.5) * 0.2 : 1;
        ctx.lineWidth = Math.min(10, Math.max(2, (telemetry.t4 / 1000) * 2)) * pulse4;
        ctx.strokeStyle = quaternaryStr;
        ctx.shadowColor = quaternaryStr;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(anchor4X, anchor4Y, 6, 0, Math.PI * 2); ctx.fill();
    }

    // Draw Anchors
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(anchor1X, originY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(anchor2X, originY, 6, 0, Math.PI * 2); ctx.fill();

    // Draw Load Point
    ctx.beginPath();
    ctx.arc(loadX, loadY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb800';
    ctx.fill();

    // Draw Load Box
    const boxW = 60;
    const boxH = 60;
    ctx.fillStyle = 'rgba(255, 184, 0, 0.2)';
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 2;

    // Simulate slight swing if sim active
    const swing = simActive ? Math.sin(time * 2) * 2 : 0;
    ctx.fillRect(loadX - boxW / 2 + swing, loadY + 15, boxW, boxH);
    ctx.strokeRect(loadX - boxW / 2 + swing, loadY + 15, boxW, boxH);

    ctx.fillStyle = '#ffb800';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${telemetry.liveLoad.toFixed(0)}${config.unit}`, loadX + swing, loadY + 45);
}

function updateDOM() {
    els.liveLoad.textContent = telemetry.liveLoad.toFixed(2);
    els.liveT1.textContent = telemetry.t1.toFixed(2);
    els.liveT2.textContent = telemetry.t2.toFixed(2);
    els.liveT3.textContent = telemetry.t3.toFixed(2);
    els.liveT4.textContent = telemetry.t4.toFixed(2);

    els.t1Display.textContent = telemetry.t1.toFixed(1) + ` ${config.unit}`;
    els.t2Display.textContent = telemetry.t2.toFixed(1) + ` ${config.unit}`;
    els.t3Display.textContent = telemetry.t3.toFixed(1) + ` ${config.unit}`;
    els.t4Display.textContent = telemetry.t4.toFixed(1) + ` ${config.unit}`;

    els.sf.textContent = telemetry.sf.toFixed(1);
    els.sf.className = 'data-value tech-font';
    if (telemetry.sf >= 5) els.sf.classList.add('safe');
    else if (telemetry.sf >= 3) els.sf.classList.add('warn');
    else els.sf.classList.add('danger');
}

function loop() {
    time += 0.016; // Approx 60fps

    if (simActive) {
        // Add jitter to load (Perlin noise like)
        const loadJitter = (Math.sin(time * 3) + Math.sin(time * 7.5) * 0.5) * 20;
        telemetry.liveLoad = Math.max(10, config.load + loadJitter);

        // Output periodic logs
        if (Math.random() < 0.01) {
            log(`Dynamic shock load detected: +${Math.abs(loadJitter).toFixed(1)}kg`);
        }
    }

    calculateTension();
    updateDOM();
    draw();

    requestAnimationFrame(loop);
}

// Start
init();
