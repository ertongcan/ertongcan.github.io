import {
    AdMob,
    RewardAdPluginEvents,
    BannerAdPluginEvents,
    BannerAdSize,
    BannerAdPosition
} from '@capacitor-community/admob';

let isRewardLoading = false;
let rewardedLoaded = false;
let onRewardCallback = null;
import {ADID, ADID_INTER} from './config.js';
export async function setupBanner() {
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log("Banner Loaded");
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => {
        console.log("Banner size changed:", size);
    });

    const options = {
        adId: ADID,
        adSize: BannerAdSize.ADAPTIVE_BANNER, // default
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
    };

    // Show the footer banner
    AdMob.showBanner(options);
}
export async function setupRewardedAd(onReward) {
    onRewardCallback = onReward;

    // Reward loaded event
    AdMob.addListener('onRewardedVideoAdLoaded', (info) => {
        console.log("Reward ad loaded:", info);
    });

    // Reward granted event
    AdMob.addListener('onRewarded', (rewardItem) => {
        console.log("Reward granted:", rewardItem);
        // Here increase your movesLeft etc.
    });

    // Reward granted event
    AdMob.addListener(RewardAdPluginEvents.Rewarded, (inf) => {
        console.log("Rewarded", inf.amount, inf.type);
        if (onRewardCallback) {
            onRewardCallback(inf.amount);
        }
    });

    // Reward granted event
    AdMob.addListener('onRewardedVideoAdShowed', () => {
        console.log("Reward video ad showed:");
    });

    // Reload ad after closing
    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Dismissed the admob ad');
    });
}

export async function rewardVideo() {



    await AdMob.prepareRewardVideoAd({
        adId:ADID_INTER ,
        isTesting: false,
    });

    try {
        await AdMob.showRewardVideoAd();
        console.log("Reward ad shown");
    } catch (err) {
        console.error("Error showing reward:", err);
    }

}
