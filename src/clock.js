"use strict";

const ALARM_NAME = "alarm";
let currentInterval = null;
import {
  getTimerData,
  startTimerData,
  CLOCK_STATUS,
  pauseTimerData,
  resetClockStatus,
  Status,
  getRemainingTimeFromStorage,
  doneTimerData,
  POMODORO_TIME_MIN,
} from "./storage.js";

function startTimer(remainingTimeMs, cb) {
  // Get remaining time from storage
  // background script will set alarm
  chrome.runtime.sendMessage(
    {
      type: ALARM_NAME,
      payload: {
        seconds: remainingTimeMs / 1000,
      },
    },
    (response) => {
      console.log(response.message);
    }
  );

  startTimerData(remainingTimeMs);

  currentInterval = setInterval(updateTimer, 500, () => {
    doneTimerData(() => {
      clearInterval(currentInterval);
      if (cb !== undefined) {
        cb();
      }
    });
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
    }
    //else {
    //  console.log("getRemainingTime no callback");
    //  done_cb();
    //}
  });
}

function pauseTimer(cb) {
  //updateTimer();
  clearInterval(currentInterval);
  chrome.alarms.clear("alarm");
  pauseTimerData(cb);
}

function updateTimer(doneCallback) {
  getTimerData((result) => {
    console.log(`updateTimer ${result[CLOCK_STATUS]}`);
    if (result[CLOCK_STATUS] === Status.Started) {
      getRemainingTime(
        (remainingTime) => {
          let min = Math.floor(remainingTime / 60);
          let sec = remainingTime % 60;
          let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
          document.getElementById("pomodoro_clock").innerHTML =
            remainingTimeText;
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
        }
        let min = Math.floor(remainingTimeSec / 60);
        let sec = remainingTimeSec % 60;
        let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
        document.getElementById("pomodoro_clock").innerHTML = remainingTimeText;
      });
    } else if (result[CLOCK_STATUS] === Status.NotStarted) {
      document.getElementById(
        "pomodoro_clock"
      ).innerHTML = `${result[POMODORO_TIME_MIN]}:00`;
    }
  });
}

function resetTimer(cb) {
  resetClockStatus(cb);
}

function doneTimer(cb) {
  doneTimerData(() => {
    updateTimer();
    cb();
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
