"use strict";
import { setIconStatus } from "./icon.js";
import {
  POMODORO_TIME_SEC,
  CLOCK_STATUS,
  LAST_REMAINING_TIME_SEC,
  getTimerData,
  stepNext,
  initializeTimerConst,
  initiateTimerData,
  resetClockStatus,
  Status,
  resumeTimerData,
  pauseTimerData,
} from "./storage.js";
import { Status as ButtonStatus } from "./button.js";
// With background scripts you can communicate extension files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const ALARM_NAME = "alarm";
initializeTimerConst();
resetClockStatus();
chrome.alarms.clear(ALARM_NAME);

function initiateTimer(remainingTimeSec) {
  initiateTimerData(remainingTimeSec, setIconStatus);
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: remainingTimeSec / 60,
  });
}

function resumeTimer() {
  console.log("resume timer");
  resumeTimerData((result) => {
    console.log(result);
    if (result[LAST_REMAINING_TIME_SEC] < 1) {
      console.log("Remaining time too small");
      setTimeout(() => {
        stepNext(result, (nextStep) => {
          console.log(nextStep);
          chrome.notifications.create(Math.random().toString(), {
            title: "Pomodoro Alarm",
            iconUrl: "icons/icons8-tomato-64.png",
            type: "basic",
            message: _getMessage(nextStep[CLOCK_STATUS]),
          });
          if (nextStep[LAST_REMAINING_TIME_SEC]) {
            console.log(
              `Starting alarm for ${nextStep[CLOCK_STATUS]}, ${nextStep[LAST_REMAINING_TIME_SEC]}sec`
            );
            chrome.alarms.create(ALARM_NAME, {
              delayInMinutes: nextStep[LAST_REMAINING_TIME_SEC] / 60,
            });
          }
          setIconStatus(nextStep);
          chrome.runtime.sendMessage({
            time: nextStep[LAST_REMAINING_TIME_SEC],
            ...nextStep,
          });
        });
      }, 2000);
    } else {
      console.log(`creating alarm again ${result[LAST_REMAINING_TIME_SEC]}`);
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: result[LAST_REMAINING_TIME_SEC] / 60,
      });
      chrome.runtime.sendMessage({
        time: result[LAST_REMAINING_TIME_SEC],
        ...result,
      });
    }
    setIconStatus(result);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type === ButtonStatus.Start) {
    getTimerData((result) => {
      initiateTimer(result[POMODORO_TIME_SEC]);
      chrome.runtime.sendMessage({
        time: result[POMODORO_TIME_SEC],
        [CLOCK_STATUS]: Status.Started,
      });
    });
  } else if (request.type === ButtonStatus.Pause) {
    chrome.alarms.clear(ALARM_NAME);
    pauseTimerData((result) => {
      chrome.runtime.sendMessage({
        time: result[LAST_REMAINING_TIME_SEC],
        [CLOCK_STATUS]: Status.Paused,
      });
      setIconStatus(result);
    });
  } else if (request.type === ButtonStatus.Reset) {
    getTimerData((result) => {
      resetClockStatus();
      setIconStatus({ [CLOCK_STATUS]: Status.NotStarted });
      chrome.runtime.sendMessage({
        time: result[POMODORO_TIME_SEC],
        [CLOCK_STATUS]: Status.NotStarted,
      });
    });
  } else if (request.type === ButtonStatus.Resume) {
    resumeTimer();
  }
  if (request.type === "get_timer_status") {
    getTimerData((result) => {
      setIconStatus(result);
      if (
        result[CLOCK_STATUS] == Status.Started ||
        result[CLOCK_STATUS] == Status.Break
      ) {
        chrome.alarms.get(ALARM_NAME, (alarmInfo) => {
          if (alarmInfo != undefined) {
            let remainingTime = Math.floor(
              (alarmInfo.scheduledTime - new Date()) / 1000
            );
            let remainingTimeSec = Math.max(remainingTime, 0);
            sendResponse({ time: remainingTimeSec, ...result });
          } else {
            sendResponse({ time: 0, ...result });
          }
        });
      } else if (result[CLOCK_STATUS] == Status.Paused) {
        sendResponse({ time: result[LAST_REMAINING_TIME_SEC], ...result });
      } else if (result[CLOCK_STATUS] == Status.NotStarted) {
        sendResponse({ time: result[POMODORO_TIME_SEC], ...result });
      } else if (result[CLOCK_STATUS] == Status.Done) {
        sendResponse({ time: 0, ...result });
      }
    });
  }
  return true;
});

function _getMessage(clock_status) {
  if (clock_status == Status.Break) {
    return "Time to take a break";
  } else if (clock_status == Status.Started) {
    return "Time to focus";
  } else if (clock_status == Status.Done) {
    return "Great work. Pomodoro Finished";
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm done");
  setTimeout(() => {
    getTimerData((result) => {
      stepNext(result, (nextStep) => {
        console.log(nextStep);
        chrome.notifications.create(Math.random().toString(), {
          title: "Pomodoro Alarm",
          iconUrl: "icons/icons8-tomato-64.png",
          type: "basic",
          message: _getMessage(nextStep[CLOCK_STATUS]),
        });
        if (nextStep[LAST_REMAINING_TIME_SEC]) {
          console.log(
            `Starting alarm for ${nextStep[CLOCK_STATUS]}, ${nextStep[LAST_REMAINING_TIME_SEC]}sec`
          );
          chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: nextStep[LAST_REMAINING_TIME_SEC] / 60,
          });
        }
        setIconStatus(nextStep);
        chrome.runtime.sendMessage({
          time: nextStep[LAST_REMAINING_TIME_SEC],
          ...nextStep,
        });
      });
    });
  }, 2000);

  // find next step and optionally start next step
});

// Handle stepping Pomodoro, creating alarm, and updating Icon
