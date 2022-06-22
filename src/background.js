"use strict";
import { setIconStatus } from "./icon.js";
import { getTimerData } from "./storage.js";
// With background scripts you can communicate extension files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

getTimerData((result) => {
  setIconStatus(result);
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
  chrome.alarms.clear(alarm.name);
});
