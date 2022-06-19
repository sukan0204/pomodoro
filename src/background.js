"use strict";

// With background scripts you can communicate extension files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "alarm") {
    const message = "setting alarm";
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Toggle the pinned status
      var current = tabs[0];
      chrome.action.setBadgeText({ text: current.id.toString() });
    });

    chrome.alarms.create("alarm", {
      delayInMinutes: request.payload.seconds / 60,
    });
    sendResponse({
      message,
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.action.setBadgeText({ text: "hihi" });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log(tabs);
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "alarm" },
      function (response) {}
    );
  });
  chrome.notifications.create(Math.random().toString(), {
    title: "hi",
    iconUrl: "icons/icons8-tomato-64.png",
    type: "basic",
    message: `Alarm ${alarm.name} is done`,
  });
});
