/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./admob.js":
/*!******************!*\
  !*** ./admob.js ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   rewardVideo: () => (/* binding */ rewardVideo),
/* harmony export */   setupBanner: () => (/* binding */ setupBanner),
/* harmony export */   setupRewardedAd: () => (/* binding */ setupRewardedAd)
/* harmony export */ });
/* harmony import */ var _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @capacitor-community/admob */ "./node_modules/@capacitor-community/admob/dist/esm/index.js");
/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config.js */ "./config.js");


let isRewardLoading = false;
let rewardedLoaded = false;
let onRewardCallback = null;

async function setupBanner() {
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener(_capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.BannerAdPluginEvents.Loaded, () => {
        console.log("Banner Loaded");
    });

    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener(_capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.BannerAdPluginEvents.SizeChanged, (size) => {
        console.log("Banner size changed:", size);
    });

    const options = {
        adId: _config_js__WEBPACK_IMPORTED_MODULE_1__.ADID,
        adSize: _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.BannerAdSize.ADAPTIVE_BANNER, // default
        position: _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
    };

    // Show the footer banner
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.showBanner(options);
}
async function setupRewardedAd(onReward) {
    onRewardCallback = onReward;

    // Reward loaded event
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener('onRewardedVideoAdLoaded', (info) => {
        console.log("Reward ad loaded:", info);
    });

    // Reward granted event
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener('onRewarded', (rewardItem) => {
        console.log("Reward granted:", rewardItem);
        // Here increase your movesLeft etc.
    });

    // Reward granted event
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener(_capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.RewardAdPluginEvents.Rewarded, (inf) => {
        console.log("Rewarded", inf.amount, inf.type);
        if (onRewardCallback) {
            onRewardCallback(inf.amount);
        }
    });

    // Reward granted event
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener('onRewardedVideoAdShowed', () => {
        console.log("Reward video ad showed:");
    });

    // Reload ad after closing
    _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.addListener(_capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.RewardAdPluginEvents.Dismissed, () => {
        console.log('Dismissed the admob ad');
    });
}

async function rewardVideo() {



    await _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.prepareRewardVideoAd({
        adId:_config_js__WEBPACK_IMPORTED_MODULE_1__.ADID_INTER ,
        isTesting: false,
    });

    try {
        await _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.showRewardVideoAd();
        console.log("Reward ad shown");
    } catch (err) {
        console.error("Error showing reward:", err);
    }

}


/***/ }),

/***/ "./config.js":
/*!*******************!*\
  !*** ./config.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ADID: () => (/* binding */ ADID),
/* harmony export */   ADID_INTER: () => (/* binding */ ADID_INTER)
/* harmony export */ });
const ADID ='XXX';
const ADID_INTER ="XXX";


/***/ }),

/***/ "./game.js":
/*!*****************!*\
  !*** ./game.js ***!
  \*****************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initialize: () => (/* binding */ initialize)
/* harmony export */ });
/* harmony import */ var _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @capacitor-community/admob */ "./node_modules/@capacitor-community/admob/dist/esm/index.js");
/* harmony import */ var _admob_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./admob.js */ "./admob.js");
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



function addRewardMoves(am) {
  movesLeft += am;
  console.log("Moves added! New total:", movesLeft);
  document.getElementById("moves-left").textContent = movesLeft;
}
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

    // startRound();
  } else if (movesLeft <= 0) {
    running = false;
    showFeedback(`❌ Sorry! No more moves left!`, false);
    retryBtn.style.display = "block";              // Show retry
    watchAdCntBtn.style.display = "block";
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

watchAdCntBtn.addEventListener('click', async () => {

  await (0,_admob_js__WEBPACK_IMPORTED_MODULE_1__.rewardVideo)();
  running = true;
  document.getElementById('game-ui').style.display = "block"; // Show UI again
  retryBtn.style.display = "none";                             // Hide retry until next fail
  watchAdCntBtn.style.display = "none";                             // Hide retry until next fail
  feedbackEl.textContent = "";
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

moreTapsBtn.addEventListener("click", async () => {

  await (0,_admob_js__WEBPACK_IMPORTED_MODULE_1__.rewardVideo)();



});
async function initialize() {
  await _capacitor_community_admob__WEBPACK_IMPORTED_MODULE_0__.AdMob.initialize({
    requestTrackingAuthorization: true,
    testingDevices: ["7C0E983731BBFB0DA5E9F7CD611C0679"],
    initializeForTesting: false,
  });
  console.log("AdMob initialized");
}

try {
  await initialize();
  await (0,_admob_js__WEBPACK_IMPORTED_MODULE_1__.setupRewardedAd)(addRewardMoves);
  await (0,_admob_js__WEBPACK_IMPORTED_MODULE_1__.setupBanner)();


} catch (e) {
  console.error("Problem occured while init:", e);
}


// Start first round
startRound();

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-options.interface.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-options.interface.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=banner-ad-options.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-plugin-events.enum.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-plugin-events.enum.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BannerAdPluginEvents: () => (/* binding */ BannerAdPluginEvents)
/* harmony export */ });
// This enum should be keep in sync with their native equivalents with the same name
var BannerAdPluginEvents;
(function (BannerAdPluginEvents) {
    BannerAdPluginEvents["SizeChanged"] = "bannerAdSizeChanged";
    BannerAdPluginEvents["Loaded"] = "bannerAdLoaded";
    BannerAdPluginEvents["FailedToLoad"] = "bannerAdFailedToLoad";
    /**
     * Open "Adsense" Event after user click banner
     */
    BannerAdPluginEvents["Opened"] = "bannerAdOpened";
    /**
     * Close "Adsense" Event after user click banner
     */
    BannerAdPluginEvents["Closed"] = "bannerAdClosed";
    /**
     * Similarly, this method should be called when an impression is recorded for the ad by the mediated SDK.
     */
    BannerAdPluginEvents["AdImpression"] = "bannerAdImpression";
})(BannerAdPluginEvents || (BannerAdPluginEvents = {}));
//# sourceMappingURL=banner-ad-plugin-events.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-position.enum.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-position.enum.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BannerAdPosition: () => (/* binding */ BannerAdPosition)
/* harmony export */ });
/**
 * @see https://developer.android.com/reference/android/widget/LinearLayout#attr_android:gravity
 */
var BannerAdPosition;
(function (BannerAdPosition) {
    /**
     * Banner position be top-center
     */
    BannerAdPosition["TOP_CENTER"] = "TOP_CENTER";
    /**
     * Banner position be center
     */
    BannerAdPosition["CENTER"] = "CENTER";
    /**
     * Banner position be bottom-center(default)
     */
    BannerAdPosition["BOTTOM_CENTER"] = "BOTTOM_CENTER";
})(BannerAdPosition || (BannerAdPosition = {}));
//# sourceMappingURL=banner-ad-position.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-size.enum.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-size.enum.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BannerAdSize: () => (/* binding */ BannerAdSize)
/* harmony export */ });
/**
 *  For more information:
 *  https://developers.google.com/admob/ios/banner#banner_sizes
 *  https://developers.google.com/android/reference/com/google/android/gms/ads/AdSize
 *
 * */
var BannerAdSize;
(function (BannerAdSize) {
    /**
     * Mobile Marketing Association (MMA)
     * banner ad size (320x50 density-independent pixels).
     */
    BannerAdSize["BANNER"] = "BANNER";
    /**
     * Interactive Advertising Bureau (IAB)
     * full banner ad size (468x60 density-independent pixels).
     */
    BannerAdSize["FULL_BANNER"] = "FULL_BANNER";
    /**
     * Large banner ad size (320x100 density-independent pixels).
     */
    BannerAdSize["LARGE_BANNER"] = "LARGE_BANNER";
    /**
     * Interactive Advertising Bureau (IAB)
     * medium rectangle ad size (300x250 density-independent pixels).
     */
    BannerAdSize["MEDIUM_RECTANGLE"] = "MEDIUM_RECTANGLE";
    /**
     * Interactive Advertising Bureau (IAB)
     * leaderboard ad size (728x90 density-independent pixels).
     */
    BannerAdSize["LEADERBOARD"] = "LEADERBOARD";
    /**
     * A dynamically sized banner that is full-width and auto-height.
     */
    BannerAdSize["ADAPTIVE_BANNER"] = "ADAPTIVE_BANNER";
    /**
     * @deprecated
     * Will be removed in next AdMob versions use `ADAPTIVE_BANNER`
     * Screen width x 32|50|90
     */
    BannerAdSize["SMART_BANNER"] = "SMART_BANNER";
})(BannerAdSize || (BannerAdSize = {}));
//# sourceMappingURL=banner-ad-size.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-definitions.interface.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/banner-definitions.interface.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=banner-definitions.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-size.interface.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/banner-size.interface.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=banner-size.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/banner/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/banner/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BannerAdPluginEvents: () => (/* reexport safe */ _banner_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_1__.BannerAdPluginEvents),
/* harmony export */   BannerAdPosition: () => (/* reexport safe */ _banner_ad_position_enum__WEBPACK_IMPORTED_MODULE_2__.BannerAdPosition),
/* harmony export */   BannerAdSize: () => (/* reexport safe */ _banner_ad_size_enum__WEBPACK_IMPORTED_MODULE_3__.BannerAdSize)
/* harmony export */ });
/* harmony import */ var _banner_ad_options_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./banner-ad-options.interface */ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-options.interface.js");
/* harmony import */ var _banner_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./banner-ad-plugin-events.enum */ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-plugin-events.enum.js");
/* harmony import */ var _banner_ad_position_enum__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./banner-ad-position.enum */ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-position.enum.js");
/* harmony import */ var _banner_ad_size_enum__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./banner-ad-size.enum */ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-size.enum.js");
/* harmony import */ var _banner_definitions_interface__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./banner-definitions.interface */ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-definitions.interface.js");
/* harmony import */ var _banner_size_interface__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./banner-size.interface */ "./node_modules/@capacitor-community/admob/dist/esm/banner/banner-size.interface.js");






//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-debug-geography.enum.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/consent/consent-debug-geography.enum.js ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AdmobConsentDebugGeography: () => (/* binding */ AdmobConsentDebugGeography)
/* harmony export */ });
/**
 *  For more information:
 *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#debuggeography
 *
 * */
var AdmobConsentDebugGeography;
(function (AdmobConsentDebugGeography) {
    /**
     * Debug geography disabled.
     */
    AdmobConsentDebugGeography[AdmobConsentDebugGeography["DISABLED"] = 0] = "DISABLED";
    /**
     * Geography appears as in EEA for debug devices.
     */
    AdmobConsentDebugGeography[AdmobConsentDebugGeography["EEA"] = 1] = "EEA";
    /**
     * Geography appears as not in EEA for debug devices.
     */
    AdmobConsentDebugGeography[AdmobConsentDebugGeography["NOT_EEA"] = 2] = "NOT_EEA";
})(AdmobConsentDebugGeography || (AdmobConsentDebugGeography = {}));
//# sourceMappingURL=consent-debug-geography.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-definition.interface.js":
/*!**************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/consent/consent-definition.interface.js ***!
  \**************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=consent-definition.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-info.interface.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/consent/consent-info.interface.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=consent-info.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-request-options.interface.js":
/*!*******************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/consent/consent-request-options.interface.js ***!
  \*******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=consent-request-options.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-status.enum.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/consent/consent-status.enum.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AdmobConsentStatus: () => (/* binding */ AdmobConsentStatus)
/* harmony export */ });
/**
 *  For more information:
 *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#consentstatus
 *
 * */
var AdmobConsentStatus;
(function (AdmobConsentStatus) {
    /**
     * User consent not required.
     */
    AdmobConsentStatus["NOT_REQUIRED"] = "NOT_REQUIRED";
    /**
     * User consent already obtained.
     */
    AdmobConsentStatus["OBTAINED"] = "OBTAINED";
    /**
     * User consent required but not yet obtained.
     */
    AdmobConsentStatus["REQUIRED"] = "REQUIRED";
    /**
     * Unknown consent status, AdsConsent.requestInfoUpdate needs to be called to update it.
     */
    AdmobConsentStatus["UNKNOWN"] = "UNKNOWN";
})(AdmobConsentStatus || (AdmobConsentStatus = {}));
//# sourceMappingURL=consent-status.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/consent/index.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/consent/index.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AdmobConsentDebugGeography: () => (/* reexport safe */ _consent_debug_geography_enum__WEBPACK_IMPORTED_MODULE_1__.AdmobConsentDebugGeography),
/* harmony export */   AdmobConsentStatus: () => (/* reexport safe */ _consent_status_enum__WEBPACK_IMPORTED_MODULE_0__.AdmobConsentStatus)
/* harmony export */ });
/* harmony import */ var _consent_status_enum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./consent-status.enum */ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-status.enum.js");
/* harmony import */ var _consent_debug_geography_enum__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./consent-debug-geography.enum */ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-debug-geography.enum.js");
/* harmony import */ var _consent_request_options_interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./consent-request-options.interface */ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-request-options.interface.js");
/* harmony import */ var _consent_info_interface__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./consent-info.interface */ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-info.interface.js");
/* harmony import */ var _consent_definition_interface__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./consent-definition.interface */ "./node_modules/@capacitor-community/admob/dist/esm/consent/consent-definition.interface.js");





//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/definitions.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/definitions.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MaxAdContentRating: () => (/* binding */ MaxAdContentRating)
/* harmony export */ });
var MaxAdContentRating;
(function (MaxAdContentRating) {
    /**
     * Content suitable for general audiences, including families.
     */
    MaxAdContentRating["General"] = "General";
    /**
     * Content suitable for most audiences with parental guidance.
     */
    MaxAdContentRating["ParentalGuidance"] = "ParentalGuidance";
    /**
     * Content suitable for teen and older audiences.
     */
    MaxAdContentRating["Teen"] = "Teen";
    /**
     * Content suitable only for mature audiences.
     */
    MaxAdContentRating["MatureAudience"] = "MatureAudience";
})(MaxAdContentRating || (MaxAdContentRating = {}));
//# sourceMappingURL=definitions.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AdMob: () => (/* binding */ AdMob),
/* harmony export */   AdmobConsentDebugGeography: () => (/* reexport safe */ _consent_index__WEBPACK_IMPORTED_MODULE_6__.AdmobConsentDebugGeography),
/* harmony export */   AdmobConsentStatus: () => (/* reexport safe */ _consent_index__WEBPACK_IMPORTED_MODULE_6__.AdmobConsentStatus),
/* harmony export */   BannerAdPluginEvents: () => (/* reexport safe */ _banner_index__WEBPACK_IMPORTED_MODULE_2__.BannerAdPluginEvents),
/* harmony export */   BannerAdPosition: () => (/* reexport safe */ _banner_index__WEBPACK_IMPORTED_MODULE_2__.BannerAdPosition),
/* harmony export */   BannerAdSize: () => (/* reexport safe */ _banner_index__WEBPACK_IMPORTED_MODULE_2__.BannerAdSize),
/* harmony export */   InterstitialAdPluginEvents: () => (/* reexport safe */ _interstitial_index__WEBPACK_IMPORTED_MODULE_3__.InterstitialAdPluginEvents),
/* harmony export */   MaxAdContentRating: () => (/* reexport safe */ _definitions__WEBPACK_IMPORTED_MODULE_1__.MaxAdContentRating),
/* harmony export */   RewardAdPluginEvents: () => (/* reexport safe */ _reward_index__WEBPACK_IMPORTED_MODULE_5__.RewardAdPluginEvents),
/* harmony export */   RewardInterstitialAdPluginEvents: () => (/* reexport safe */ _reward_interstitial_index__WEBPACK_IMPORTED_MODULE_4__.RewardInterstitialAdPluginEvents)
/* harmony export */ });
/* harmony import */ var _capacitor_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @capacitor/core */ "./node_modules/@capacitor-community/admob/node_modules/@capacitor/core/dist/index.js");
/* harmony import */ var _definitions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./definitions */ "./node_modules/@capacitor-community/admob/dist/esm/definitions.js");
/* harmony import */ var _banner_index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./banner/index */ "./node_modules/@capacitor-community/admob/dist/esm/banner/index.js");
/* harmony import */ var _interstitial_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./interstitial/index */ "./node_modules/@capacitor-community/admob/dist/esm/interstitial/index.js");
/* harmony import */ var _reward_interstitial_index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./reward-interstitial/index */ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/index.js");
/* harmony import */ var _reward_index__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./reward/index */ "./node_modules/@capacitor-community/admob/dist/esm/reward/index.js");
/* harmony import */ var _consent_index__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./consent/index */ "./node_modules/@capacitor-community/admob/dist/esm/consent/index.js");
/* harmony import */ var _shared_index__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./shared/index */ "./node_modules/@capacitor-community/admob/dist/esm/shared/index.js");

const AdMob = (0,_capacitor_core__WEBPACK_IMPORTED_MODULE_0__.registerPlugin)('AdMob', {
    web: () => __webpack_require__.e(/*! import() */ "node_modules_capacitor-community_admob_dist_esm_web_js").then(__webpack_require__.bind(__webpack_require__, /*! ./web */ "./node_modules/@capacitor-community/admob/dist/esm/web.js")).then((m) => new m.AdMobWeb()),
});








//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/interstitial/index.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/interstitial/index.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InterstitialAdPluginEvents: () => (/* reexport safe */ _interstitial_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_0__.InterstitialAdPluginEvents)
/* harmony export */ });
/* harmony import */ var _interstitial_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./interstitial-ad-plugin-events.enum */ "./node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-ad-plugin-events.enum.js");
/* harmony import */ var _interstitial_definitions_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./interstitial-definitions.interface */ "./node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-definitions.interface.js");


//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-ad-plugin-events.enum.js":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-ad-plugin-events.enum.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InterstitialAdPluginEvents: () => (/* binding */ InterstitialAdPluginEvents)
/* harmony export */ });
// This enum should be keep in sync with their native equivalents with the same name
var InterstitialAdPluginEvents;
(function (InterstitialAdPluginEvents) {
    /**
     * Emits after trying to prepare and Interstitial, when it is loaded and ready to be show
     */
    InterstitialAdPluginEvents["Loaded"] = "interstitialAdLoaded";
    /**
     * Emits after trying to prepare and Interstitial, when it could not be loaded
     */
    InterstitialAdPluginEvents["FailedToLoad"] = "interstitialAdFailedToLoad";
    /**
     * Emits when the Interstitial ad is visible to the user
     */
    InterstitialAdPluginEvents["Showed"] = "interstitialAdShowed";
    /**
     * Emits when the Interstitial ad is failed to show
     */
    InterstitialAdPluginEvents["FailedToShow"] = "interstitialAdFailedToShow";
    /**
     * Emits when the Interstitial ad is not visible to the user anymore.
     */
    InterstitialAdPluginEvents["Dismissed"] = "interstitialAdDismissed";
})(InterstitialAdPluginEvents || (InterstitialAdPluginEvents = {}));
//# sourceMappingURL=interstitial-ad-plugin-events.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-definitions.interface.js":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-definitions.interface.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=interstitial-definitions.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/index.js":
/*!***************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/index.js ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RewardInterstitialAdPluginEvents: () => (/* reexport safe */ _reward_interstitial_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_0__.RewardInterstitialAdPluginEvents)
/* harmony export */ });
/* harmony import */ var _reward_interstitial_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reward-interstitial-ad-plugin-events.enum */ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-plugin-events.enum.js");
/* harmony import */ var _reward_interstitial_definitions_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reward-interstitial-definitions.interface */ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-definitions.interface.js");
/* harmony import */ var _reward_interstitial_item_interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./reward-interstitial-item.interface */ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-item.interface.js");
/* harmony import */ var _reward_interstitial_ad_options_interface__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./reward-interstitial-ad-options.interface */ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-options.interface.js");




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-options.interface.js":
/*!**************************************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-options.interface.js ***!
  \**************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=reward-interstitial-ad-options.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-plugin-events.enum.js":
/*!***************************************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-plugin-events.enum.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RewardInterstitialAdPluginEvents: () => (/* binding */ RewardInterstitialAdPluginEvents)
/* harmony export */ });
// This enum should be keep in sync with their native equivalents with the same name
var RewardInterstitialAdPluginEvents;
(function (RewardInterstitialAdPluginEvents) {
    /**
     * Emits after trying to prepare a RewardAd and the Video is loaded and ready to be show
     */
    RewardInterstitialAdPluginEvents["Loaded"] = "onRewardedInterstitialAdLoaded";
    /**
     * Emits after trying to prepare a RewardAd when it could not be loaded
     */
    RewardInterstitialAdPluginEvents["FailedToLoad"] = "onRewardedInterstitialAdFailedToLoad";
    /**
     * Emits when the AdReward video is visible to the user
     */
    RewardInterstitialAdPluginEvents["Showed"] = "onRewardedInterstitialAdShowed";
    /**
     * Emits when the AdReward video is failed to show
     */
    RewardInterstitialAdPluginEvents["FailedToShow"] = "onRewardedInterstitialAdFailedToShow";
    /**
     * Emits when the AdReward video is not visible to the user anymore.
     *
     * **Important**: This has nothing to do with the reward it self. This event
     * will emits in this two cases:
     * 1. The user starts the video ad but close it before the reward emit.
     * 2. The user start the video and see it until end, then gets the reward
     * and after that the ad is closed.
     */
    RewardInterstitialAdPluginEvents["Dismissed"] = "onRewardedInterstitialAdDismissed";
    /**
     * Emits when user get rewarded from AdReward
     */
    RewardInterstitialAdPluginEvents["Rewarded"] = "onRewardedInterstitialAdReward";
})(RewardInterstitialAdPluginEvents || (RewardInterstitialAdPluginEvents = {}));
//# sourceMappingURL=reward-interstitial-ad-plugin-events.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-definitions.interface.js":
/*!***************************************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-definitions.interface.js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=reward-interstitial-definitions.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-item.interface.js":
/*!********************************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-item.interface.js ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=reward-interstitial-item.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RewardAdPluginEvents: () => (/* reexport safe */ _reward_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_0__.RewardAdPluginEvents)
/* harmony export */ });
/* harmony import */ var _reward_ad_plugin_events_enum__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reward-ad-plugin-events.enum */ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-plugin-events.enum.js");
/* harmony import */ var _reward_definitions_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reward-definitions.interface */ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-definitions.interface.js");
/* harmony import */ var _reward_item_interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./reward-item.interface */ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-item.interface.js");
/* harmony import */ var _reward_ad_options_interface__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./reward-ad-options.interface */ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-options.interface.js");




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-options.interface.js":
/*!************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-options.interface.js ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=reward-ad-options.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-plugin-events.enum.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-plugin-events.enum.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RewardAdPluginEvents: () => (/* binding */ RewardAdPluginEvents)
/* harmony export */ });
// This enum should be keep in sync with their native equivalents with the same name
var RewardAdPluginEvents;
(function (RewardAdPluginEvents) {
    /**
     * Emits after trying to prepare a RewardAd and the Video is loaded and ready to be show
     */
    RewardAdPluginEvents["Loaded"] = "onRewardedVideoAdLoaded";
    /**
     * Emits after trying to prepare a RewardAd when it could not be loaded
     */
    RewardAdPluginEvents["FailedToLoad"] = "onRewardedVideoAdFailedToLoad";
    /**
     * Emits when the AdReward video is visible to the user
     */
    RewardAdPluginEvents["Showed"] = "onRewardedVideoAdShowed";
    /**
     * Emits when the AdReward video is failed to show
     */
    RewardAdPluginEvents["FailedToShow"] = "onRewardedVideoAdFailedToShow";
    /**
     * Emits when the AdReward video is not visible to the user anymore.
     *
     * **Important**: This has nothing to do with the reward it self. This event
     * will emits in this two cases:
     * 1. The user starts the video ad but close it before the reward emit.
     * 2. The user start the video and see it until end, then gets the reward
     * and after that the ad is closed.
     */
    RewardAdPluginEvents["Dismissed"] = "onRewardedVideoAdDismissed";
    /**
     * Emits when user get rewarded from AdReward
     */
    RewardAdPluginEvents["Rewarded"] = "onRewardedVideoAdReward";
})(RewardAdPluginEvents || (RewardAdPluginEvents = {}));
//# sourceMappingURL=reward-ad-plugin-events.enum.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-definitions.interface.js":
/*!*************************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward/reward-definitions.interface.js ***!
  \*************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=reward-definitions.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/reward/reward-item.interface.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/reward/reward-item.interface.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=reward-item.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/shared/ad-load-info.interface.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/shared/ad-load-info.interface.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=ad-load-info.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/shared/ad-options.interface.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/shared/ad-options.interface.js ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=ad-options.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/shared/admob-error.interface.js":
/*!******************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/shared/admob-error.interface.js ***!
  \******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);

//# sourceMappingURL=admob-error.interface.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/dist/esm/shared/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/dist/esm/shared/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ad_load_info_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ad-load-info.interface */ "./node_modules/@capacitor-community/admob/dist/esm/shared/ad-load-info.interface.js");
/* harmony import */ var _ad_options_interface__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ad-options.interface */ "./node_modules/@capacitor-community/admob/dist/esm/shared/ad-options.interface.js");
/* harmony import */ var _admob_error_interface__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./admob-error.interface */ "./node_modules/@capacitor-community/admob/dist/esm/shared/admob-error.interface.js");



//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/@capacitor-community/admob/node_modules/@capacitor/core/dist/index.js":
/*!********************************************************************************************!*\
  !*** ./node_modules/@capacitor-community/admob/node_modules/@capacitor/core/dist/index.js ***!
  \********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Capacitor: () => (/* binding */ Capacitor),
/* harmony export */   CapacitorCookies: () => (/* binding */ CapacitorCookies),
/* harmony export */   CapacitorException: () => (/* binding */ CapacitorException),
/* harmony export */   CapacitorHttp: () => (/* binding */ CapacitorHttp),
/* harmony export */   CapacitorPlatforms: () => (/* binding */ CapacitorPlatforms),
/* harmony export */   ExceptionCode: () => (/* binding */ ExceptionCode),
/* harmony export */   Plugins: () => (/* binding */ Plugins),
/* harmony export */   WebPlugin: () => (/* binding */ WebPlugin),
/* harmony export */   WebView: () => (/* binding */ WebView),
/* harmony export */   addPlatform: () => (/* binding */ addPlatform),
/* harmony export */   buildRequestInit: () => (/* binding */ buildRequestInit),
/* harmony export */   registerPlugin: () => (/* binding */ registerPlugin),
/* harmony export */   registerWebPlugin: () => (/* binding */ registerWebPlugin),
/* harmony export */   setPlatform: () => (/* binding */ setPlatform)
/* harmony export */ });
/*! Capacitor: https://capacitorjs.com/ - MIT License */
const createCapacitorPlatforms = (win) => {
    const defaultPlatformMap = new Map();
    defaultPlatformMap.set('web', { name: 'web' });
    const capPlatforms = win.CapacitorPlatforms || {
        currentPlatform: { name: 'web' },
        platforms: defaultPlatformMap,
    };
    const addPlatform = (name, platform) => {
        capPlatforms.platforms.set(name, platform);
    };
    const setPlatform = (name) => {
        if (capPlatforms.platforms.has(name)) {
            capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
        }
    };
    capPlatforms.addPlatform = addPlatform;
    capPlatforms.setPlatform = setPlatform;
    return capPlatforms;
};
const initPlatforms = (win) => (win.CapacitorPlatforms = createCapacitorPlatforms(win));
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
const CapacitorPlatforms = /*#__PURE__*/ initPlatforms((typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
            ? window
            : typeof __webpack_require__.g !== 'undefined'
                ? __webpack_require__.g
                : {}));
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
const addPlatform = CapacitorPlatforms.addPlatform;
/**
 * @deprecated Set `CapacitorCustomPlatform` on the window object prior to runtime executing in the web app instead
 */
const setPlatform = CapacitorPlatforms.setPlatform;

const legacyRegisterWebPlugin = (cap, webPlugin) => {
    var _a;
    const config = webPlugin.config;
    const Plugins = cap.Plugins;
    if (!(config === null || config === void 0 ? void 0 : config.name)) {
        // TODO: add link to upgrade guide
        throw new Error(`Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."`);
    }
    // TODO: add link to upgrade guide
    console.warn(`Capacitor plugin "${config.name}" is using the deprecated "registerWebPlugin()" function`);
    if (!Plugins[config.name] || ((_a = config === null || config === void 0 ? void 0 : config.platforms) === null || _a === void 0 ? void 0 : _a.includes(cap.getPlatform()))) {
        // Add the web plugin into the plugins registry if there already isn't
        // an existing one. If it doesn't already exist, that means
        // there's no existing native implementation for it.
        // - OR -
        // If we already have a plugin registered (meaning it was defined in the native layer),
        // then we should only overwrite it if the corresponding web plugin activates on
        // a certain platform. For example: Geolocation uses the WebPlugin on Android but not iOS
        Plugins[config.name] = webPlugin;
    }
};

var ExceptionCode;
(function (ExceptionCode) {
    /**
     * API is not implemented.
     *
     * This usually means the API can't be used because it is not implemented for
     * the current platform.
     */
    ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
    /**
     * API is not available.
     *
     * This means the API can't be used right now because:
     *   - it is currently missing a prerequisite, such as network connectivity
     *   - it requires a particular platform or browser version
     */
    ExceptionCode["Unavailable"] = "UNAVAILABLE";
})(ExceptionCode || (ExceptionCode = {}));
class CapacitorException extends Error {
    constructor(message, code, data) {
        super(message);
        this.message = message;
        this.code = code;
        this.data = data;
    }
}
const getPlatformId = (win) => {
    var _a, _b;
    if (win === null || win === void 0 ? void 0 : win.androidBridge) {
        return 'android';
    }
    else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
        return 'ios';
    }
    else {
        return 'web';
    }
};

const createCapacitor = (win) => {
    var _a, _b, _c, _d, _e;
    const capCustomPlatform = win.CapacitorCustomPlatform || null;
    const cap = win.Capacitor || {};
    const Plugins = (cap.Plugins = cap.Plugins || {});
    /**
     * @deprecated Use `capCustomPlatform` instead, default functions like registerPlugin will function with the new object.
     */
    const capPlatforms = win.CapacitorPlatforms;
    const defaultGetPlatform = () => {
        return capCustomPlatform !== null
            ? capCustomPlatform.name
            : getPlatformId(win);
    };
    const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
    const defaultIsNativePlatform = () => getPlatform() !== 'web';
    const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
    const defaultIsPluginAvailable = (pluginName) => {
        const plugin = registeredPlugins.get(pluginName);
        if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            // JS implementation available for the current platform.
            return true;
        }
        if (getPluginHeader(pluginName)) {
            // Native implementation available.
            return true;
        }
        return false;
    };
    const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) ||
        defaultIsPluginAvailable;
    const defaultGetPluginHeader = (pluginName) => { var _a; return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find(h => h.name === pluginName); };
    const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
    const handleError = (err) => win.console.error(err);
    const pluginMethodNoop = (_target, prop, pluginName) => {
        return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
    };
    const registeredPlugins = new Map();
    const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
        const registeredPlugin = registeredPlugins.get(pluginName);
        if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
        }
        const platform = getPlatform();
        const pluginHeader = getPluginHeader(pluginName);
        let jsImplementation;
        const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
                jsImplementation =
                    typeof jsImplementations[platform] === 'function'
                        ? (jsImplementation = await jsImplementations[platform]())
                        : (jsImplementation = jsImplementations[platform]);
            }
            else if (capCustomPlatform !== null &&
                !jsImplementation &&
                'web' in jsImplementations) {
                jsImplementation =
                    typeof jsImplementations['web'] === 'function'
                        ? (jsImplementation = await jsImplementations['web']())
                        : (jsImplementation = jsImplementations['web']);
            }
            return jsImplementation;
        };
        const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
                const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find(m => prop === m.name);
                if (methodHeader) {
                    if (methodHeader.rtype === 'promise') {
                        return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                    }
                    else {
                        return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                    }
                }
                else if (impl) {
                    return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
                }
            }
            else if (impl) {
                return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            }
            else {
                throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
        };
        const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
                const p = loadPluginImplementation().then(impl => {
                    const fn = createPluginMethod(impl, prop);
                    if (fn) {
                        const p = fn(...args);
                        remove = p === null || p === void 0 ? void 0 : p.remove;
                        return p;
                    }
                    else {
                        throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                    }
                });
                if (prop === 'addListener') {
                    p.remove = async () => remove();
                }
                return p;
            };
            // Some flair ✨
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, 'name', {
                value: prop,
                writable: false,
                configurable: false,
            });
            return wrapper;
        };
        const addListener = createPluginMethodWrapper('addListener');
        const removeListener = createPluginMethodWrapper('removeListener');
        const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
                const callbackId = await call;
                removeListener({
                    eventName,
                    callbackId,
                }, callback);
            };
            const p = new Promise(resolve => call.then(() => resolve({ remove })));
            p.remove = async () => {
                console.warn(`Using addListener() without 'await' is deprecated.`);
                await remove();
            };
            return p;
        };
        const proxy = new Proxy({}, {
            get(_, prop) {
                switch (prop) {
                    // https://github.com/facebook/react/issues/20030
                    case '$$typeof':
                        return undefined;
                    case 'toJSON':
                        return () => ({});
                    case 'addListener':
                        return pluginHeader ? addListenerNative : addListener;
                    case 'removeListener':
                        return removeListener;
                    default:
                        return createPluginMethodWrapper(prop);
                }
            },
        });
        Plugins[pluginName] = proxy;
        registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: new Set([
                ...Object.keys(jsImplementations),
                ...(pluginHeader ? [platform] : []),
            ]),
        });
        return proxy;
    };
    const registerPlugin = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
    // Add in convertFileSrc for web, it will already be available in native context
    if (!cap.convertFileSrc) {
        cap.convertFileSrc = filePath => filePath;
    }
    cap.getPlatform = getPlatform;
    cap.handleError = handleError;
    cap.isNativePlatform = isNativePlatform;
    cap.isPluginAvailable = isPluginAvailable;
    cap.pluginMethodNoop = pluginMethodNoop;
    cap.registerPlugin = registerPlugin;
    cap.Exception = CapacitorException;
    cap.DEBUG = !!cap.DEBUG;
    cap.isLoggingEnabled = !!cap.isLoggingEnabled;
    // Deprecated props
    cap.platform = cap.getPlatform();
    cap.isNative = cap.isNativePlatform();
    return cap;
};
const initCapacitorGlobal = (win) => (win.Capacitor = createCapacitor(win));

const Capacitor = /*#__PURE__*/ initCapacitorGlobal(typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
            ? window
            : typeof __webpack_require__.g !== 'undefined'
                ? __webpack_require__.g
                : {});
const registerPlugin = Capacitor.registerPlugin;
/**
 * @deprecated Provided for backwards compatibility for Capacitor v2 plugins.
 * Capacitor v3 plugins should import the plugin directly. This "Plugins"
 * export is deprecated in v3, and will be removed in v4.
 */
const Plugins = Capacitor.Plugins;
/**
 * Provided for backwards compatibility. Use the registerPlugin() API
 * instead, and provide the web plugin as the "web" implmenetation.
 * For example
 *
 * export const Example = registerPlugin('Example', {
 *   web: () => import('./web').then(m => new m.Example())
 * })
 *
 * @deprecated Deprecated in v3, will be removed from v4.
 */
const registerWebPlugin = (plugin) => legacyRegisterWebPlugin(Capacitor, plugin);

/**
 * Base class web plugins should extend.
 */
class WebPlugin {
    constructor(config) {
        this.listeners = {};
        this.retainedEventArguments = {};
        this.windowListeners = {};
        if (config) {
            // TODO: add link to upgrade guide
            console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
            this.config = config;
        }
    }
    addListener(eventName, listenerFunc) {
        let firstListener = false;
        const listeners = this.listeners[eventName];
        if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
        }
        this.listeners[eventName].push(listenerFunc);
        // If we haven't added a window listener for this event and it requires one,
        // go ahead and add it
        const windowListener = this.windowListeners[eventName];
        if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
        }
        if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
        }
        const remove = async () => this.removeListener(eventName, listenerFunc);
        const p = Promise.resolve({ remove });
        return p;
    }
    async removeAllListeners() {
        this.listeners = {};
        for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
        }
        this.windowListeners = {};
    }
    notifyListeners(eventName, data, retainUntilConsumed) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
            if (retainUntilConsumed) {
                let args = this.retainedEventArguments[eventName];
                if (!args) {
                    args = [];
                }
                args.push(data);
                this.retainedEventArguments[eventName] = args;
            }
            return;
        }
        listeners.forEach(listener => listener(data));
    }
    hasListeners(eventName) {
        return !!this.listeners[eventName].length;
    }
    registerWindowListener(windowEventName, pluginEventName) {
        this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: event => {
                this.notifyListeners(pluginEventName, event);
            },
        };
    }
    unimplemented(msg = 'not implemented') {
        return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
    }
    unavailable(msg = 'not available') {
        return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
    }
    async removeListener(eventName, listenerFunc) {
        const listeners = this.listeners[eventName];
        if (!listeners) {
            return;
        }
        const index = listeners.indexOf(listenerFunc);
        this.listeners[eventName].splice(index, 1);
        // If there are no more listeners for this type of event,
        // remove the window listener
        if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
        }
    }
    addWindowListener(handle) {
        window.addEventListener(handle.windowEventName, handle.handler);
        handle.registered = true;
    }
    removeWindowListener(handle) {
        if (!handle) {
            return;
        }
        window.removeEventListener(handle.windowEventName, handle.handler);
        handle.registered = false;
    }
    sendRetainedArgumentsForEvent(eventName) {
        const args = this.retainedEventArguments[eventName];
        if (!args) {
            return;
        }
        delete this.retainedEventArguments[eventName];
        args.forEach(arg => {
            this.notifyListeners(eventName, arg);
        });
    }
}

const WebView = /*#__PURE__*/ registerPlugin('WebView');
/******** END WEB VIEW PLUGIN ********/
/******** COOKIES PLUGIN ********/
/**
 * Safely web encode a string value (inspired by js-cookie)
 * @param str The string value to encode
 */
const encode = (str) => encodeURIComponent(str)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);
/**
 * Safely web decode a string value (inspired by js-cookie)
 * @param str The string value to decode
 */
const decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class CapacitorCookiesPluginWeb extends WebPlugin {
    async getCookies() {
        const cookies = document.cookie;
        const cookieMap = {};
        cookies.split(';').forEach(cookie => {
            if (cookie.length <= 0)
                return;
            // Replace first "=" with CAP_COOKIE to prevent splitting on additional "="
            let [key, value] = cookie.replace(/=/, 'CAP_COOKIE').split('CAP_COOKIE');
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
        });
        return cookieMap;
    }
    async setCookie(options) {
        try {
            // Safely Encoded Key/Value
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            // Clean & sanitize options
            const expires = `; expires=${(options.expires || '').replace('expires=', '')}`; // Default is "; expires="
            const path = (options.path || '/').replace('path=', ''); // Default is "path=/"
            const domain = options.url != null && options.url.length > 0
                ? `domain=${options.url}`
                : '';
            document.cookie = `${encodedKey}=${encodedValue || ''}${expires}; path=${path}; ${domain};`;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async deleteCookie(options) {
        try {
            document.cookie = `${options.key}=; Max-Age=0`;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async clearCookies() {
        try {
            const cookies = document.cookie.split(';') || [];
            for (const cookie of cookies) {
                document.cookie = cookie
                    .replace(/^ +/, '')
                    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async clearAllCookies() {
        try {
            await this.clearCookies();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}
const CapacitorCookies = registerPlugin('CapacitorCookies', {
    web: () => new CapacitorCookiesPluginWeb(),
});
// UTILITY FUNCTIONS
/**
 * Read in a Blob value and return it as a base64 string
 * @param blob The blob value to convert to a base64 string
 */
const readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const base64String = reader.result;
        // remove prefix "data:application/pdf;base64,"
        resolve(base64String.indexOf(',') >= 0
            ? base64String.split(',')[1]
            : base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
});
/**
 * Normalize an HttpHeaders map by lowercasing all of the values
 * @param headers The HttpHeaders object to normalize
 */
const normalizeHttpHeaders = (headers = {}) => {
    const originalKeys = Object.keys(headers);
    const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
    const normalized = loweredKeys.reduce((acc, key, index) => {
        acc[key] = headers[originalKeys[index]];
        return acc;
    }, {});
    return normalized;
};
/**
 * Builds a string of url parameters that
 * @param params A map of url parameters
 * @param shouldEncode true if you should encodeURIComponent() the values (true by default)
 */
const buildUrlParams = (params, shouldEncode = true) => {
    if (!params)
        return null;
    const output = Object.entries(params).reduce((accumulator, entry) => {
        const [key, value] = entry;
        let encodedValue;
        let item;
        if (Array.isArray(value)) {
            item = '';
            value.forEach(str => {
                encodedValue = shouldEncode ? encodeURIComponent(str) : str;
                item += `${key}=${encodedValue}&`;
            });
            // last character will always be "&" so slice it off
            item.slice(0, -1);
        }
        else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
        }
        return `${accumulator}&${item}`;
    }, '');
    // Remove initial "&" from the reduce
    return output.substr(1);
};
/**
 * Build the RequestInit object based on the options passed into the initial request
 * @param options The Http plugin options
 * @param extra Any extra RequestInit values
 */
const buildRequestInit = (options, extra = {}) => {
    const output = Object.assign({ method: options.method || 'GET', headers: options.headers }, extra);
    // Get the content-type
    const headers = normalizeHttpHeaders(options.headers);
    const type = headers['content-type'] || '';
    // If body is already a string, then pass it through as-is.
    if (typeof options.data === 'string') {
        output.body = options.data;
    }
    // Build request initializers based off of content-type
    else if (type.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
        }
        output.body = params.toString();
    }
    else if (type.includes('multipart/form-data') ||
        options.data instanceof FormData) {
        const form = new FormData();
        if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
                form.append(key, value);
            });
        }
        else {
            for (const key of Object.keys(options.data)) {
                form.append(key, options.data[key]);
            }
        }
        output.body = form;
        const headers = new Headers(output.headers);
        headers.delete('content-type'); // content-type will be set by `window.fetch` to includy boundary
        output.headers = headers;
    }
    else if (type.includes('application/json') ||
        typeof options.data === 'object') {
        output.body = JSON.stringify(options.data);
    }
    return output;
};
// WEB IMPLEMENTATION
class CapacitorHttpPluginWeb extends WebPlugin {
    /**
     * Perform an Http request given a set of options
     * @param options Options to build the HTTP request
     */
    async request(options) {
        const requestInit = buildRequestInit(options, options.webFetchExtra);
        const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
        const url = urlParams ? `${options.url}?${urlParams}` : options.url;
        const response = await fetch(url, requestInit);
        const contentType = response.headers.get('content-type') || '';
        // Default to 'text' responseType so no parsing happens
        let { responseType = 'text' } = response.ok ? options : {};
        // If the response content-type is json, force the response to be json
        if (contentType.includes('application/json')) {
            responseType = 'json';
        }
        let data;
        let blob;
        switch (responseType) {
            case 'arraybuffer':
            case 'blob':
                blob = await response.blob();
                data = await readBlobAsBase64(blob);
                break;
            case 'json':
                data = await response.json();
                break;
            case 'document':
            case 'text':
            default:
                data = await response.text();
        }
        // Convert fetch headers to Capacitor HttpHeaders
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        return {
            data,
            headers,
            status: response.status,
            url: response.url,
        };
    }
    /**
     * Perform an Http GET request given a set of options
     * @param options Options to build the HTTP request
     */
    async get(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'GET' }));
    }
    /**
     * Perform an Http POST request given a set of options
     * @param options Options to build the HTTP request
     */
    async post(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'POST' }));
    }
    /**
     * Perform an Http PUT request given a set of options
     * @param options Options to build the HTTP request
     */
    async put(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'PUT' }));
    }
    /**
     * Perform an Http PATCH request given a set of options
     * @param options Options to build the HTTP request
     */
    async patch(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'PATCH' }));
    }
    /**
     * Perform an Http DELETE request given a set of options
     * @param options Options to build the HTTP request
     */
    async delete(options) {
        return this.request(Object.assign(Object.assign({}, options), { method: 'DELETE' }));
    }
}
const CapacitorHttp = registerPlugin('CapacitorHttp', {
    web: () => new CapacitorHttpPluginWeb(),
});
/******** END HTTP PLUGIN ********/


//# sourceMappingURL=index.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var hasSymbol = typeof Symbol === "function";
/******/ 		var webpackQueues = hasSymbol ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = hasSymbol ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = hasSymbol ? Symbol("webpack error") : "__webpack_error__";
/******/
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			var handle = (deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}
/******/ 			var done = (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue))
/******/ 			body(handle, done);
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		// data-webpack is not used as build has no uniqueName
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/
/******/
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/
/******/ 		// no prefetching
/******/
/******/ 		// no preloaded
/******/
/******/ 		// no HMR
/******/
/******/ 		// no HMR manifest
/******/
/******/ 		// no on chunks loaded
/******/
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/
/******/ 		}
/******/
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/
/************************************************************************/
/******/
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./game.js");
/******/
/******/ })()
;
//# sourceMappingURL=bundle.js.map
