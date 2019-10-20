console.log(`I'm the options script`);


document.addEventListener('DOMContentLoaded', function (event) {
  chrome.storage.local.get([
    'showRouletteSpoiler',
    'showChatEmotes',
    'showLiveDeals',
    'liveDealsMinPrice',
    'liveDealsMaxPrice',
  ], function (options) {

    console.log('settings', options);

    // Settings are loaded
    // Save reference to option elements
    var rouletteSpoilerToggle = document.getElementById("roulette-spoiler-toggle");
    var emotesToggle = document.getElementById("emotes-toggle");
    var liveDealsToggle = document.getElementById("live-deals-toggle");
    var liveDealsBtn = document.getElementById("live-deals-btn");
    var liveDealsMin = document.getElementById("live-deals-min-price");
    var liveDealsMax = document.getElementById("live-deals-max-price");

    // Update UI elements
    if (options.showRouletteSpoiler) {
      rouletteSpoilerToggle.checked = options.showRouletteSpoiler;
    }
    if (options.showChatEmotes) {
      emotesToggle.checked = options.showChatEmotes;
    }
    if (options.showLiveDeals) {
      liveDealsToggle.checked = options.showLiveDeals;
    }
    if (options.liveDealsMinPrice) {
      liveDealsMin.value = options.liveDealsMinPrice;
    }
    if (options.liveDealsMaxPrice) {
      liveDealsMax.value = options.liveDealsMaxPrice;
    }

    // Run functions on events
    rouletteSpoilerToggle.onchange = function () {
      chrome.storage.local.set({ 'showRouletteSpoiler': rouletteSpoilerToggle.checked });
    }
    emotesToggle.onchange = function () {
      chrome.storage.local.set({ 'showChatEmotes': emotesToggle.checked });
    }
    liveDealsToggle.onchange = function () {
      chrome.storage.local.set({ 'showLiveDeals': liveDealsToggle.checked });
    }
    liveDealsBtn.onclick = function () {
      chrome.storage.local.set({ 'liveDealsMinPrice': parseInt(liveDealsMin.value) });
      chrome.storage.local.set({ 'liveDealsMaxPrice': parseInt(liveDealsMax.value) });
    }
  });
});