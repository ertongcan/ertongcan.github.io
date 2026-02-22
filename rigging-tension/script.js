// State
let config = {
    load: 1000,
    angle1: 30,
    angle2: 30
};

let telemetry = {
    t1: 0,
    t2: 0,
    sf: 5,
    liveLoad: 1000,
    liveAngle1: 30,
    liveAngle2: 30
};

let simActive = false;
let deviceAngleActive = false;
let time = 0;

// DOM Elements
const els = {
    loadIn: document.getElementById('load-weight'),
    a1In: document.getElementById('angle-1'),
    a2In: document.getElementById('angle-2'),
    loadVal: document.getElementById('load-val'),
    a1Val: document.getElementById('a1-val'),
    a2Val: document.getElementById('a2-val'),

    liveLoad: document.getElementById('live-load'),
    liveT1: document.getElementById('live-t1'),
    liveT2: document.getElementById('live-t2'),
    sf: document.getElementById('safety-factor'),
    t1Display: document.getElementById('t1-display'),
    t2Display: document.getElementById('t2-display'),

    btnSim: document.getElementById('toggle-sim'),
    btnDevice: document.getElementById('toggle-device'),
    sensorStatus: document.getElementById('sensor-status'),
    sensorText: document.getElementById('sensor-text'),
    logList: document.getElementById('log-list'),

    canvas: document.getElementById('vector-canvas')
};

const ctx = els.canvas.getContext('2d');

// Initialize event listeners
function init() {
    els.loadIn.addEventListener('input', (e) => { config.load = parseFloat(e.target.value); updateUI(); });
    els.a1In.addEventListener('input', (e) => { config.angle1 = parseFloat(e.target.value); updateUI(); });
    els.a2In.addEventListener('input', (e) => { config.angle2 = parseFloat(e.target.value); updateUI(); });

    els.btnSim.addEventListener('click', toggleSim);
    els.btnDevice.addEventListener('click', toggleDeviceAngle);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    requestAnimationFrame(loop);
}

function updateUI() {
    if (!simActive) telemetry.liveLoad = config.load;
    if (!deviceAngleActive) {
        telemetry.liveAngle1 = config.angle1;
        telemetry.liveAngle2 = config.angle2;
    }

    els.loadVal.textContent = config.load.toFixed(0);
    els.a1Val.textContent = config.angle1.toFixed(0);
    els.a2Val.textContent = config.angle2.toFixed(0);
}

function toggleSim() {
    simActive = !simActive;
    els.btnSim.classList.toggle('active', simActive);
    updateSensorStatus();
    log(`Load simulation ${simActive ? 'started' : 'stopped'}`);
}

function toggleDeviceAngle() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    activateDeviceOrientation();
                } else {
                    log("Device orientation permission denied");
                }
            })
            .catch(console.error);
    } else {
        // Non iOS 13+ devices
        activateDeviceOrientation();
    }
}

function activateDeviceOrientation() {
    deviceAngleActive = !deviceAngleActive;
    els.btnDevice.classList.toggle('active', deviceAngleActive);
    updateSensorStatus();
    log(`Device orientation ${deviceAngleActive ? 'enabled' : 'disabled'}`);

    if (deviceAngleActive) {
        window.addEventListener('deviceorientation', handleOrientation);
    } else {
        window.removeEventListener('deviceorientation', handleOrientation);
        telemetry.liveAngle1 = config.angle1; // Reset
    }
}

function handleOrientation(event) {
    if (!deviceAngleActive) return;
    // Use gamma (left/right tilt) or beta (front/back)
    // Map -90 to 90 to an angle 0 to 89
    let tilt = event.gamma || 0; // -90 to 90
    let adjustedAngle = Math.abs(tilt);
    if (adjustedAngle > 89) adjustedAngle = 89;
    telemetry.liveAngle1 = adjustedAngle;

    // Update the slider to reflect
    config.angle1 = adjustedAngle;
    els.a1In.value = adjustedAngle;
    updateUI();
}

function updateSensorStatus() {
    const active = simActive || deviceAngleActive;
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
    // Convert to radians
    const a1Rad = telemetry.liveAngle1 * Math.PI / 180;
    const a2Rad = telemetry.liveAngle2 * Math.PI / 180;
    const w = telemetry.liveLoad;

    // T1 * sin(A1) = T2 * sin(A2) -> Horizontal equilibrium
    // T1 * cos(A1) + T2 * cos(A2) = W -> Vertical equilibrium

    // Solving:
    // T1 = (W * sin(A2)) / (sin(A1)*cos(A2) + cos(A1)*sin(A2)) = W * sin(A2) / sin(A1 + A2)
    // T2 = (W * sin(A1)) / sin(A1 + A2)

    const denom = Math.sin(a1Rad + a2Rad);

    if (denom < 0.001) {
        // Angles are both essentially 0, simple split
        telemetry.t1 = w / 2;
        telemetry.t2 = w / 2;
    } else {
        telemetry.t1 = (w * Math.sin(a2Rad)) / denom;
        telemetry.t2 = (w * Math.sin(a1Rad)) / denom;
    }

    // Calculate naive safety factor assuming a Safe Working Load of 5000kg per leg
    const swl = 5000;
    const maxTension = Math.max(telemetry.t1, telemetry.t2);
    telemetry.sf = maxTension > 0 ? swl / maxTension : 99.9;
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
    ctx.fillText(`${telemetry.liveLoad.toFixed(0)}kg`, loadX + swing, loadY + 45);
}

function updateDOM() {
    els.liveLoad.textContent = telemetry.liveLoad.toFixed(2);
    els.liveT1.textContent = telemetry.t1.toFixed(2);
    els.liveT2.textContent = telemetry.t2.toFixed(2);

    els.t1Display.textContent = telemetry.t1.toFixed(1) + ' kg';
    els.t2Display.textContent = telemetry.t2.toFixed(1) + ' kg';

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
