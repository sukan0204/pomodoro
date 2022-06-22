"use strict";

import { Button } from "./button.js";
import { doneTimer, updateTimer, startUpdateTimer } from "./clock.js";
import "./app.css";
import { getTimerData, initializeTimerConst, CLOCK_STATUS } from "./storage.js";
import { setIconStatus } from "./icon.js";

(function () {
  // Storage
  initializeTimerConst();
  function setupDashboard() {
    let button = new Button(
      document.getElementById("button"),
      document.getElementById("stop")
    );
    updateTimer(() => {
      doneTimer();
      button.setDone();
    });
    getTimerData((result) => {
      button.set(result[CLOCK_STATUS]);
      setIconStatus(result);
      console.log(result[CLOCK_STATUS]);
    });
  }

  setupDashboard();
})();
