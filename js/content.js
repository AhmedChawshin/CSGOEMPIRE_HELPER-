console.log(`I'm the content script.`);

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

  // Initiliaze custom elements and logic
  initializeEmotes();
  initializeRouletteSpoiler();

  showLiveitems();
  // Poll items ever so often to notify user about deals
  // setInterval(showLiveitems, 1 * 60 * 1000); // 1 minute

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
    iconUrl: "images/favicon_empire.png"
  };
  var notificationOptionsBundle = {
    type: "basic",
    title: "Skin found on CSGOEmpire",
    message: "We have found bundle for you!",
    iconUrl: "images/favicon_empire.png"
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

function Userstats() {
  //henter inn data fra csv
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://csgoempire.com/api/v2/match-betting/history?per_page=999999999999999999999999999999999999999999999999999999999999999999999999&page=1", true);
  xhr.onload = function (e) {
    var MatchBettingData = JSON.parse(xhr.response);

    var winratio = [];

    var totalprofit = 0;
    for (var i = 0; i < MatchBettingData.data.length; i++) {
      totalprofit += parseInt(MatchBettingData.data[i].profit / 100);
      winratio.push(MatchBettingData.data[i].is_win);
    }

    console.log("matchbetting total " + totalprofit + " Winratio " + parseInt(getOccurrence(winratio, 1) / winratio.length * 100).toFixed(0) + "%");

  };
  //vis den ikke har connection sÃ¥ viser vi denne feilmeldingen
  xhr.onerror = function () {
    console.error("** En feil skjedde");
  };
  xhr.send();
}

function Match() {
  //henter inn data fra csv
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://csgoempire.com/api/v2/match-betting/history?per_page=999999999999999999999999999999999999999999999999999999999999999999999999&page=1", true);
  xhr.onload = function (e) {
    var MatchBettingData = JSON.parse(xhr.response);

    //inserting how many wins/loss
    var winratio = [];


    var totalprofit = 0;
    for (var i = 0; i < MatchBettingData.data.length; i++) {

      //Getting total profit from Match betting
      totalprofit += parseInt(MatchBettingData.data[i].profit / 100);

      //Pushing the wins/loss ratio
      winratio.push(MatchBettingData.data[i].is_win);
    }

    console.log("matchbetting total " + totalprofit + " Winratio " + parseInt(getOccurrence(winratio, 1) / winratio.length * 100).toFixed(0) + "%");

  };
  //vis den ikke har connection sÃ¥ viser vi denne feilmeldingen
  xhr.onerror = function () {
    console.error("** An error occured");
  };
  xhr.send();
}

//this function is just checking the array for multiply values
function getOccurrence(array, value) {
  var count = 0;
  array.forEach((v) => (v === value && count++));
  return count;
}

function initializeRouletteSpoiler() {
  // Listen to roulette websocket
  var socket = io('wss://roulette.csgoempire.com', {transports: ['websocket']});
  socket.on('connect', function () {
    console.log('Websocket connected.');
  });
  socket.on('disconnect', function (error) {
    console.log('Websocket closed.');
  });
  socket.on('error', function (e) {
    console.log('Websocket error', e);
  });
  socket.on('roll', function (data) {
    var winner = data.winner;
    var roulettestatus = "";
    if (winner >= 8 && winner <= 14) {
      console.log("CT has been hit");
      roulettestatus = "CT has been hit";
    } else if (winner >= 1 && winner <= 7) {
      console.log("T has been hit");
      roulettestatus = "T has been hit";
    } else if (winner == 0) {
      console.log("Dice has been hit");
      roulettestatus = "DICE has been hit";
    } else if (winner == "bonus") {
      roulettestatus = "BONUS has been hit";
      console.log("Bonus has been hit!");
    }
    document.getElementById("lastroulette").innerHTML = `<b>Roulette</b>: <i>${roulettestatus}</i>`;
  });

  // Create element to show current spoiler
  var div = document.createElement("information");
  div.id = 'information';
  document.body.appendChild(div);
  div.innerHTML = '<span id="lastroulette"><b>Roulette</b>: waiting... </span>';
}

// Emotes
var arrEmotes = [
  ["PogChamp", "https://static-cdn.jtvnw.net/emoticons/v1/88/1.0"],
  ["Kappa", "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0"],
  ["Keepo", "https://static-cdn.jtvnw.net/emoticons/v1/1902/1.0"],
  ["cmonBruh", "https://static-cdn.jtvnw.net/emoticons/v1/84608/1.0"],
  ["TriHard", "https://static-cdn.jtvnw.net/emoticons/v1/120232/1.0"],
  ["4Head", "https://static-cdn.jtvnw.net/emoticons/v1/354/1.0"],
  ["ANELE", "https://static-cdn.jtvnw.net/emoticons/v1/3792/1.0"],
  ["BabyRage", "https://static-cdn.jtvnw.net/emoticons/v1/22639/1.0"],
  ["BlessRNG", "https://static-cdn.jtvnw.net/emoticons/v1/153556/1.0"],
  ["BibleThump", "https://static-cdn.jtvnw.net/emoticons/v1/86/1.0"],
  ["CoolCat", "https://static-cdn.jtvnw.net/emoticons/v1/58127/1.0"],
  ["DansGame", "https://static-cdn.jtvnw.net/emoticons/v1/33/1.0"],
  ["GivePLZ", "https://static-cdn.jtvnw.net/emoticons/v1/112291/1.0"],
  ["FailFish", "https://static-cdn.jtvnw.net/emoticons/v1/360/1.0"],
  ["Jebaited", "https://static-cdn.jtvnw.net/emoticons/v1/114836/1.0"],
  ["monkaS", "https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/1x"],
  ["LUL", "https://static-cdn.jtvnw.net/emoticons/v1/425618/1.0"]
];

function initializeEmotes() {
  // Create the emote container
  const emoteContainer = document.createElement("emotes");
  emoteContainer.id = 'emotes';

  let emotesHTML = '';
  for (var i = 0; i < arrEmotes.length; i++) {
    emotesHTML += `<button type="button" width="300"><img src="${arrEmotes[i][1]}" id="${arrEmotes[i][0]}" data-emote-text="${arrEmotes[i][0]}" /></button>`;
  }
  // Set innerHTML
  emoteContainer.innerHTML = `<p id='paraEmotes' class='btnImage'>Emotes for chat </p><div class='emotes-container'>${emotesHTML}<div>`;

  // Append it to the body
  document.body.appendChild(emoteContainer);

  // Set click listener to all of our created emote elements
  for (var i = 0; i < arrEmotes.length; i++) {
    const emoteElement = document.getElementById(arrEmotes[i][0]);
    if (emoteElement) {
      emoteElement.onclick = function () {
        const textArea = document.querySelector('.chat-input textarea');
        // emoteElement.dataset.emoteText === emoteElement.getAttribute('data-emote-text');
        textArea.value += ` ${emoteElement.dataset.emoteText}`;
      }
    }
  }
}
