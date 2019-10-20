console.log(`Background script is running`);
window.onload = run;

var options = {
  showRouletteSpoiler: false,
  showChatEmotes: false,
  showLiveDeals: false,
  liveDealsMinPrice: 0,
  liveDealsMaxPrice: 0,
};

// Load all needed setting strings from Chrome StorageArea
function loadSettings(callback) {
  chrome.storage.local.get([
    'showRouletteSpoiler',
    'showChatEmotes',
    'showLiveDeals',
    'liveDealsMinPrice',
    'liveDealsMaxPrice',
  ], function (items) {
    for (var key in items) {
      options[key] = items[key];
    }
    console.log('settings', items);
    // All settings are set
    if (typeof callback === 'function') {
      callback();
    }
  });
}

// Updates local setting and saves it to Chrome StorageArea
function updateSetting(key, value) {
  options[key] = value;
  chrome.storage.local.set({ key: value });
  console.log(key, value, 'setting updated');
}

function onSettingsChanged() {
  // Settings were changed, update UI etc
  // Show or hide emote section
  const emoteContainer = document.getElementById('emotes');
  if (emoteContainer) {
    emoteContainer.style.display = options.showChatEmotes ? 'initial' : 'none';
  }
  // Show or hide roulette spoiler
  const rouletteSpoiler = document.getElementById('information');
  if (rouletteSpoiler) {
    rouletteSpoiler.style.display = options.showRouletteSpoiler ? 'initial' : 'none';
  }
}

function run() {
  chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
      options[key] = changes[key].newValue;
      console.log(`setting '${key}' changed from '${changes[key].oldValue}' to '${changes[key].newValue}'`);
    }
    onSettingsChanged();
  });
  loadSettings(function () {
    // All settings loaded
    // Run once to update UI on start-up
    onSettingsChanged();
  });


  showLiveitems();
  // Poll items ever so often to notify user about deals
  setInterval(showLiveitems, 10000); // 1 * 60 * 1000

  // TODO Fix:
  // Match();
  // Userstats();
}

function showLiveitems() {
  if (!options.showLiveDeals) {
    // Don't run if the user has the setting disabled
    return;
  }

  // Notifcation settings
  var notificationOptionsSingle = {
    type: "basic",
    title: "Skin found on CSGOEmpire",
    message: "We have found a skin within your price range!",
    iconUrl: "images/csgoempire-logo.png"
  };
  var notificationOptionsBundle = {
    type: "basic",
    title: "Skin found on CSGOEmpire",
    message: "We have found bundle for you!",
    iconUrl: "images/csgoempire-logo.png"
  };

  var getTrades = new XMLHttpRequest();
  getTrades.open("GET", "https://csgoempire.com/api/v2/p2p/inventory/instant", true);
  getTrades.onload = function (e) {
    var items = "";
    var arrCount = [];
    var uniqueskins = [];
    var itemsLength = 0;
    var pricemath = 0;
    var status = "";
    var liveTrades = JSON.parse(getTrades.response);
    for (var i = 0; i < liveTrades.length; i++) {
      pricemath = liveTrades[i].market_value;

      if (pricemath >= options.liveDealsMinPrice && pricemath <= options.liveDealsMaxPrice) {
        if (liveTrades[i].bundle_id == liveTrades[i].bundle_id) {
          status = "bundle";
        }
        items += "$" + pricemath + " " + liveTrades[i].name;
        arrCount.push(liveTrades[i].name);
        status = "regular";

      } else {
        console.log("Skin dont exist atm");
        status = "";
      }
    }
    // TODO maybe change text in notification?
    if (status == "bundle") {
      chrome.notifications.create(notificationOptionsBundle, function () {
        console.log('Normal notification sent');
      });
    }
    if (arrCount.length >= 1 && status == "regular") {
      chrome.notifications.create(notificationOptionsSingle, function () {
        console.log('Bundle notification sent');
      });
    }
  };
  //vis den ikke har connection sÃ¥ viser vi denne feilmeldingen
  getTrades.onerror = function () {
    console.error("** En feil skjedde");
  };
  getTrades.send();
}
//this function is just checking the array for multiply values
function getOccurrence(array, value) {
  var count = 0;
  array.forEach((v) => (v === value && count++));
  return count;
}
