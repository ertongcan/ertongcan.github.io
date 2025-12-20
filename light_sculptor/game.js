const canvas = document.getElementById('canvas');
const menu = document.getElementById('menu');
const btnWhite = document.getElementById('btn-white');
const btnRed = document.getElementById('btn-red');
const btnGreen = document.getElementById('btn-green');
const btnBlue = document.getElementById('btn-blue');
const btnClose = document.getElementById('btn-close');
const btnSteady = document.getElementById('btn-steady');
const btnPulse = document.getElementById('btn-pulse');
const btnStrobe = document.getElementById('btn-strobe');

let state = {
    split: 50, warmth: 255, softness: 0,
    mode: 'white', isPulsing: false, pulseVal: 1,
    initialPinchDist: 0
};

    // --- CORE INTERACTION ---
    function updateDisplay() {
    let color;
    if (state.mode === 'white') {
    color = `rgb(255, ${Math.max(180, state.warmth)}, ${state.warmth})`;
} else if (state.mode === 'red') {
    color = `rgb(${state.warmth}, 0, 0)`;
} else if (state.mode === 'blue') {
    color = `rgb(0, 0, ${state.warmth})`;
} else if (state.mode === 'green') {
    color = `rgb(0, ${state.warmth}, 0)`;
}

    // Apply Pulse
    if (state.isPulsing) {
    canvas.style.opacity = state.pulseVal;
} else {
    canvas.style.opacity = 1;
}

    document.documentElement.style.setProperty('--light-color', color);
    document.documentElement.style.setProperty('--split', state.split + '%');
    document.documentElement.style.setProperty('--softness', state.softness + '%');
}

    // --- GESTURES ---
    let pressTimer;
    const TRIGGER_ZONE = 60;
window.addEventListener('touchstart', (e) => {

    //menu.style.display = 'flex';
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;

    // Check if the touch is in the top-right corner
    const isTopRight = (touch.clientX > screenWidth - TRIGGER_ZONE) && (touch.clientY < TRIGGER_ZONE);

    if (isTopRight) {
    // Toggle Menu
    const isHidden = menu.style.display === 'none' || menu.style.display === '';
    menu.style.display = isHidden ? 'flex' : 'none';

    // Vibrate for feedback (Requires Capacitor Haptics plugin)
    if (window.Capacitor) {
    // Haptics.impact({ style: 'light' });
}

    // Prevent the light from shifting when we just wanted the menu
    return;
}


});

window.addEventListener('touchmove', (e) => {
    // clearTimeout(pressTimer);
    if (menu.style.display === 'flex') return;
    e.preventDefault();
    const touch = e.touches[0];
    state.split = (touch.clientX / window.innerWidth) * 100;
    state.warmth = (touch.clientY / window.innerHeight) * 255;

    if (e.touches.length === 2) {
        const dX = e.touches[0].clientX - e.touches[1].clientX;
        const dY = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.sqrt(dX * dX + dY * dY);
        // Calculate change in distance
        const sensitivity = 0.15;
        const delta = (currentDist - state.initialPinchDist) * sensitivity;

        state.softness = Math.max(0, Math.min(45, state.softness + delta));
        state.initialPinchDist = currentDist; // Reset for smooth scaling
    }
    updateDisplay();
    hint.style.opacity = 0;
});

    // window.addEventListener('touchend', () => clearTimeout(pressTimer));

    // --- PRO FEATURES ---
function setMode(m) {
    state.mode = m;
    document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateDisplay();
}

let effectInterval = null;
let currentSpeed = 500; // milliseconds
let effectMode = 'none'; // 'none', 'pulse', or 'strobe'

btnWhite.addEventListener("click", () => {
    setMode('white');
});

btnGreen.addEventListener("click", () => {
    setMode('green');
});

btnRed.addEventListener("click", () => {
    setMode('red');
});

btnBlue.addEventListener("click", () => {
    setMode('blue');
});
function setEffect(mode) {
    effectMode = mode;

    // UI Update
    document.querySelectorAll('[id^="fx-"]').forEach(b => b.classList.remove('active'));
    document.getElementById(`fx-${mode}`).classList.add('active');

    // Show/Hide speed slider
    document.getElementById('speed-control').style.display = (mode === 'none') ? 'none' : 'block';

    // Clear previous interval
    if (effectInterval) clearInterval(effectInterval);
    canvas.style.opacity = 1; // Reset opacity

    if (mode === 'pulse') {
        runPulse();
    } else if (mode === 'strobe') {
        runStrobe();
    }
}

btnSteady.addEventListener("click",  () => {
    setEffect("steady");
});

btnStrobe.addEventListener("click",  () => {
    setEffect("strobe");
});

btnPulse.addEventListener("click",  () => {
    setEffect("pulse");
});

function updateSpeed(val) {
    currentSpeed = val;
    document.getElementById('speed-label').innerText = `SPEED: ${val}ms`;

    // Restart effect to apply new speed immediately
    setEffect(effectMode);
}

    function runPulse() {
    // Pulse is a soft CSS transition
    canvas.style.transition = `opacity ${currentSpeed}ms ease-in-out`;
    let toggle = false;

    effectInterval = setInterval(() => {
    canvas.style.opacity = toggle ? 1 : 0.1;
    toggle = !toggle;
}, currentSpeed);
}

function runStrobe() {
    // Strobe is a sharp cut (no transition)
    canvas.style.transition = 'none';

    effectInterval = setInterval(() => {
        canvas.style.opacity = 0; // Flash Off
        setTimeout(() => {
            canvas.style.opacity = 1; // Flash On
        }, 10); // 10ms "On" time creates a sharp frozen-motion effect
    }, currentSpeed);
}


function closeMenu() { menu.style.display = 'none'; }

btnClose.addEventListener("click",  () => {
    closeMenu();
});
