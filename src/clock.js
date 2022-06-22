"use strict";

const ALARM_NAME = "alarm";
let currentInterval = null;
import {
  getTimerData,
  startTimerData,
  pauseTimerData,
  doneTimerData,
  resetClockStatus,
  CLOCK_STATUS,
  Status,
  getRemainingTimeFromStorage,
  POMODORO_TIME_SEC,
} from "./storage.js";

import { setIconStatus } from "./icon.js";

function startTimer(remainingTimeMs, cb) {
  chrome.alarms.create("alarm", {
    delayInMinutes: remainingTimeMs / 60000,
  });
  startTimerData(remainingTimeMs, setIconStatus);
  updateTimer(() => {
    doneTimer();
    button.setDone();
  });
}

function getRemainingTime(yes_cb, done_cb) {
  chrome.alarms.get(ALARM_NAME, (alarmInfo) => {
    if (alarmInfo != undefined) {
      let remainingTime = Math.floor(
        (alarmInfo.scheduledTime - new Date()) / 1000
      );
      let remainingTimeSec = Math.max(remainingTime, 0);
      if (remainingTimeSec > 0) {
        yes_cb(remainingTimeSec);
      } else {
        console.log("getRemainingTime done callback");
        done_cb();
      }
    } else {
      console.log("getRemainingTime no callback");
      done_cb();
    }
  });
}

function pauseTimer(cb) {
  clearInterval(currentInterval);
  chrome.alarms.clear("alarm");
  pauseTimerData((result) => {
    cb(result);
    setIconStatus(result);
  });
}

let globalRemainingTime;
function simpleUpdateTimer(doneCallback) {
  globalRemainingTime -= 1;
  console.log(`simpleUpdateTimer ${globalRemainingTime}`);
  if (globalRemainingTime > 0) {
    let min = Math.floor(globalRemainingTime / 60);
    let sec = globalRemainingTime % 60;
    let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
    document.getElementById("pomodoro_clock").innerHTML = remainingTimeText;
  } else {
    doneCallback();
  }
}

function updateTimer(doneCallback) {
  getTimerData((result) => {
    console.log(`updateTimer ${result[CLOCK_STATUS]}`);
    if (result[CLOCK_STATUS] === Status.Started) {
      getRemainingTime(
        (remainingTime) => {
          console.log("updateTimer-remainingtime" + remainingTime);
          let min = Math.floor(remainingTime / 60);
          let sec = remainingTime % 60;
          let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
          document.getElementById("pomodoro_clock").innerHTML =
            remainingTimeText;
          globalRemainingTime = remainingTime;
          currentInterval = setInterval(simpleUpdateTimer, 1000, doneCallback);
        },
        () => {
          console.log("setting to 00:00");
          document.getElementById("pomodoro_clock").innerHTML = "00:00";
          doneCallback();
        }
      );
    } else if (result[CLOCK_STATUS] === Status.Done) {
      document.getElementById("pomodoro_clock").innerHTML = "00:00";
    } else if (result[CLOCK_STATUS] === Status.Paused) {
      getRemainingTimeFromStorage(result, (remainingTime) => {
        let remainingTimeSec = Math.floor(remainingTime / 1000);
        if (remainingTime <= 0) {
          doneCallback();
        } else {
          let min = Math.floor(remainingTimeSec / 60);
          let sec = remainingTimeSec % 60;
          let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
          document.getElementById("pomodoro_clock").innerHTML =
            remainingTimeText;
        }
      });
    } else if (result[CLOCK_STATUS] === Status.NotStarted) {
      let pomodoro = result[POMODORO_TIME_SEC];
      let min = Math.floor(pomodoro / 60);
      let sec = pomodoro % 60;
      let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
      document.getElementById("pomodoro_clock").innerHTML = remainingTimeText;
    }
  });
}

function resetTimer(cb) {
  resetClockStatus((result) => {
    cb(result);
    setIconStatus(result);
  });
}

function doneTimer(cb) {
  doneTimerData(() => {
    clearInterval(currentInterval);
    updateTimer();
    if (cb !== undefined) {
      cb(result);
    }
    setIconStatus(result);
  });
}

export {
  startTimer,
  updateTimer,
  pauseTimer,
  resetTimer,
  getRemainingTime,
  doneTimer,
};

/**
 * getStatus -> in_progress, done, not_started, paused
 * based on that, setTimer and setButton
 *
 * getRemainingTime
 *
 */
