"use strict";

import { Button } from "./button.js";
import { Clock } from "./clock.js";
import { CLOCK_STATUS } from "./storage.js";
import "./app.css";

(function () {
  function setupDashboard() {
    let button = new Button(
      document.getElementById("button"),
      document.getElementById("stop")
    );
    let clock = new Clock(document.getElementById("pomodoro_clock"));
    console.log("Setting up dashboard");
    chrome.runtime.sendMessage({ type: "get_timer_status" }, (result) => {
      console.log("get_timer_status");
      console.log(result);
      button.set(result[CLOCK_STATUS]);
      clock.setUp(result[CLOCK_STATUS], result["time"]);
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      button.set(request[CLOCK_STATUS]);
      clock.setUp(request[CLOCK_STATUS], request["time"]);
      sendResponse({ done: "done" });
      return true;
    });
  }

  setupDashboard();
})();
