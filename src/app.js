"use strict";

import { Button } from "./button.js";
import { Clock } from "./clock.js";
import { parseMessage, GetTimerStatusMessage } from "./message.js";
import "./app.css";

(function () {
  function setupDashboard() {
    let button = new Button(
      document.getElementById("button"),
      document.getElementById("stop")
    );
    let clock = new Clock(document.getElementById("pomodoro_clock"));
    chrome.runtime.sendMessage(
      { message: new GetTimerStatusMessage() },
      (result) => {
        if (result.message !== undefined) {
          let message = parseMessage(result.message);
          button.set(message.clock_status);
          clock.setUp(message.clock_status, message.time);
          console.log(message);
        } else {
          console.log("undefined message");
        }
      }
    );
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request);
      let message = parseMessage(request.message);
      button.set(message.clock_status);
      clock.setUp(message.clock_status, message.time);
      sendResponse({ done: "done" });
      return true;
    });
  }

  setupDashboard();
})();
