let currentNumber = 1;
let score = 0;
let movesLeft;
let running = true;
// Initialize game
let targetNumber = 7;

const operations = ["+", "-", "×", "÷"];

const currentEl = document.getElementById('current-number');
const targetEl = document.getElementById('target-number');
const movesEl = document.getElementById('moves-left');
const feedbackEl = document.getElementById('feedback');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
// const retryBtn = document.createElement('button'); // Retry button
/*retryBtn.textContent = "New Game";
retryBtn.style.display = "none";
document.querySelector('.game-container').appendChild(retryBtn);*/
const retryBtn = document.getElementById('retry-btn');
const cntBtn = document.getElementById('cnt-btn');
const watchAdCntBtn = document.getElementById('watch-ad-continue');
const scoreEl = document.getElementById('score') || createScoreElement();
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
const highScoreEl = document.getElementById('high-score') || createHighScoreElement();

function showFeedback(message, success = true) {
  feedbackEl.textContent = message;
  feedbackEl.style.color = success ? "#28a745" : "#f44336";
  feedbackEl.classList.add('flash');
  // Keep the feedback visible for 1 second
  setTimeout(() => {
    feedbackEl.classList.remove('flash');
  }, 1000);
}

function createScoreElement() {
  const el = document.createElement('div');
  el.id = 'score';
  el.textContent = `Score: ${score}`;
  document.querySelector('.game-container').appendChild(el);
  return el;
}

function createHighScoreElement() {
  const el = document.createElement('div');
  el.id = 'high-score';
  el.textContent = `High Score: ${highScore}`;
  document.querySelector('.game-container').appendChild(el);
  return el;
}

function applyOperation(num, op, val) {
  switch(op) {
    case "+": return num + val;
    case "-": return num - val;
    case "×": return num * val;
    case "÷": return val !== 0 ? Math.floor(num / val) : num;
    default: return num;
  }
}

function pickRandomButton() {
  const op = operations[Math.floor(Math.random() * operations.length)];
  const val = Math.floor(Math.random() * 9) + 1;
  const label = `${op}${val}`;
  return { op, val, label };
}

let leftOp, rightOp;
function pickRandomOperations() {
  leftOp = pickRandomButton();
  rightOp = pickRandomButton();
  leftBtn.textContent = leftOp.label;
  rightBtn.textContent = rightOp.label;
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreEl.textContent = `High Score: ${highScore}`;
  }
}


function startRound() {
  if (!running) return;
  currentNumber = Math.floor(Math.random() * 13) + 1;
  // movesLeft = Math.floor(Math.random() * 5) + 3; // random 3-7 moves
  movesLeft = 5
  pickRandomOperations();
  updateUI();
}

function updateUI() {
  currentEl.textContent = currentNumber;
  targetEl.textContent = targetNumber;
  movesEl.textContent = `${movesLeft}`;
  scoreEl.textContent = `${score}`;
  highScoreEl.textContent = `${highScore}`;
  feedbackEl.textContent = "";
  retryBtn.style.display = "none";
}

function checkEnd() {
  if (currentNumber === targetNumber) {
    score++;
    updateHighScore();
    targetNumber = Math.floor(Math.random() * 13) + 1;
    showFeedback(`✅ Success! Next target: ${targetNumber}`);
    cntBtn.style.display = "block";
    document.getElementById('game-ui').style.display = "none";

    startRound();
  } else if (movesLeft <= 0) {
    running = false;
    showFeedback(`❌ Sorry! No more moves left!`);
    retryBtn.style.display = "block";              // Show retry
    watchAdCntBtn.style.display = "block";              // Show retry
    document.getElementById('game-ui').style.display = "none";
  }
}

// Retry resets everything and shows game UI again
retryBtn.addEventListener('click', () => {
  score = 0;
  // targetNumber = Math.floor(Math.random() * 13) + 1;
  running = true;
  document.getElementById('game-ui').style.display = "block"; // Show UI again
  retryBtn.style.display = "none";                             // Hide retry until next fail
  watchAdCntBtn.style.display = "none";                             // Hide retry until next fail
  feedbackEl.textContent = "";
  startRound();
});

cntBtn.addEventListener('click', () => {
  running = true;
  document.getElementById('game-ui').style.display = "block"; // Show UI again
  cntBtn.style.display = "none";                             // Hide retry until next fail
  feedbackEl.textContent = "";
  startRound();
});


function handleClick(btnOp) {
  if (!running || movesLeft <= 0) return;
  currentNumber = applyOperation(currentNumber, btnOp.op, btnOp.val);
  movesLeft--;
  pickRandomOperations();
  updateUI();
  checkEnd();
}

leftBtn.addEventListener('click', () => handleClick(leftOp));
rightBtn.addEventListener('click', () => handleClick(rightOp));

const moreTapsBtn = document.getElementById("watch-ad-btn");

moreTapsBtn.addEventListener("click", () => {
  // 1️⃣ Add 7 moves
  movesLeft += 7;
  document.getElementById("moves-left").textContent = movesLeft;

  // 2️⃣ Only inject AdSense once
  if (!window.adsenseLoaded) {
    window.adsenseLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1433248445674721";
    script.crossOrigin = "anonymous";

    // Append it to the <head> or container
    document.head.appendChild(script);
    // Create the <ins> container
    const ad = document.createElement("ins");
    ad.className = "adsbygoogle";
    ad.style.display = "block";
    ad.style.width = "100%";       // important!
    ad.style.height = "90px";      // or any reasonable height
    ad.setAttribute("data-ad-client", "ca-pub-1433248445674721");
    ad.setAttribute("data-ad-slot", "2462514365");
    ad.setAttribute("data-ad-format", "auto");
    ad.setAttribute("data-full-width-responsive", "true");

    document.getElementById("adsense-container").appendChild(ad);

    // Load the script
    (adsbygoogle = window.adsbygoogle || []).push({});
  }

});

// Start first round
startRound();
