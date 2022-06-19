"use strict";
import { playMusic } from "./audio";

const pageTitle = document.head.getElementsByTagName("title")[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`Pomodoro - request: '${request.type}'`);
  console.log(request);
  if (request.type === "alarm") {
    playMusic();
  }

  sendResponse("abc：" + JSON.stringify("request"));
});
