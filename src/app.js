"use strict";

import getDay from "./day";
import { Button } from "./button.js";
import { doneTimer, startTimer, updateTimer } from "./clock.js";
import "./app.css";
import {
  getTimerData,
  initializeTimerConst,
  CLOCK_STATUS,
  Status,
  getRemainingTimeFromStorage,
} from "./storage.js";

(function () {
  // Storage
  initializeTimerConst();
  function setDay() {
    const day = getDay();

    document.getElementById("day").innerHTML = day;
  }

  function setupDashboard() {
    let button = new Button(document.getElementById("button"));
    updateTimer(doneTimer);
    getTimerData((result) => {
      if (result[CLOCK_STATUS] === Status.Started) {
        console.log("timer started");
        getRemainingTimeFromStorage(result, (remainingTime) => {
          if (remainingTime > 0) {
            startTimer(remainingTime, () => {
              button.setDone();
            });
          } else {
            // set to done or reset
            doneTimer();
          }
        });
      }
      button.set(result[CLOCK_STATUS]);
    });
    setDay();
    setInterval(setDay, 1000);
  }

  setupDashboard();
})();
