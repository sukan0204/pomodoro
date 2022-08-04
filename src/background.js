"use strict";
import { setIconStatus } from "./icon.js";
import {
  ALARM_NAME,
  LAST_REMAINING_TIME_SEC,
  POMODORO_TIME_SEC,
  ButtonStatus,
  CLOCK_STATUS,
  ClockStatus,
} from "./constants.js";
import {
  getTimerData,
  stepNext,
  initializeTimerConst,
  initiateTimerData,
  resetClockStatus,
  resumeTimerData,
  pauseTimerData,
} from "./storage.js";

import {
  parseMessage,
  UIUpdateMessage,
  ButtonClickedMessage,
  GetTimerStatusMessage,
} from "./message.js";

initializeTimerConst();
resetClockStatus();
chrome.alarms.clear(ALARM_NAME);

function initiateTimer(remainingTimeSec) {
  initiateTimerData(remainingTimeSec, setIconStatus);
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: remainingTimeSec / 60,
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  let message = parseMessage(request.message);
  if (message.type === ButtonClickedMessage.type) {
    _handleButtonClickedMessage(message);
  }
  if (message.type === GetTimerStatusMessage.type) {
    _handleGetTimerStatusMessage();
  }
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  // Once an alarm is done, go to the next step after a couple seconds
  getTimerData((result) => {
    _stepNext(result);
  });
});

function _getMessage(clock_status) {
  if (clock_status == ClockStatus.Break) {
    return "Time to take a break";
  } else if (clock_status == ClockStatus.Started) {
    return "Time to focus";
  } else if (clock_status == ClockStatus.Done) {
    return "Great work. Pomodoro Finished";
  }
}

function _stepNext(result) {
  setTimeout(() => {
    stepNext(result, (nextStep) => {
      chrome.notifications.create(Math.random().toString(), {
        title: "Pomodoro Alarm",
        iconUrl: "icons/icons8-tomato-64.png",
        type: "basic",
        message: _getMessage(nextStep[CLOCK_STATUS]),
      });
      if (nextStep[LAST_REMAINING_TIME_SEC]) {
        chrome.alarms.create(ALARM_NAME, {
          delayInMinutes: nextStep[LAST_REMAINING_TIME_SEC] / 60,
        });
      }
      setIconStatus(nextStep);
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          nextStep[CLOCK_STATUS],
          nextStep[LAST_REMAINING_TIME_SEC]
        ),
      });
    });
  }, 2000);
}

function _resumeTimer() {
  resumeTimerData((result) => {
    if (result[LAST_REMAINING_TIME_SEC] < 1) {
      _stepNext(result);
    } else {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: result[LAST_REMAINING_TIME_SEC] / 60,
      });
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          result[CLOCK_STATUS],
          result[LAST_REMAINING_TIME_SEC]
        ),
      });
    }
    setIconStatus(result);
  });
}

function _handleButtonClickedMessage(message) {
  if (message.clicked_button_status === ButtonStatus.Start) {
    getTimerData((result) => {
      initiateTimer(result[POMODORO_TIME_SEC]);
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          ClockStatus.Started,
          result[POMODORO_TIME_SEC]
        ),
      });
    });
  } else if (message.clicked_button_status === ButtonStatus.Pause) {
    chrome.alarms.clear(ALARM_NAME);
    pauseTimerData((result) => {
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          ClockStatus.Paused,
          result[LAST_REMAINING_TIME_SEC]
        ),
      });
      setIconStatus(result);
    });
  } else if (message.clicked_button_status === ButtonStatus.Reset) {
    getTimerData((result) => {
      resetClockStatus();
      setIconStatus({ [CLOCK_STATUS]: ClockStatus.NotStarted });
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          ClockStatus.NotStarted,
          result[POMODORO_TIME_SEC]
        ),
      });
    });
  } else if (message.clicked_button_status === ButtonStatus.Resume) {
    _resumeTimer();
  }
}

function _handleGetTimerStatusMessage() {
  getTimerData((result) => {
    setIconStatus(result);
    if (
      result[CLOCK_STATUS] == ClockStatus.Started ||
      result[CLOCK_STATUS] == ClockStatus.Break
    ) {
      chrome.alarms.get(ALARM_NAME, (alarmInfo) => {
        if (alarmInfo != undefined) {
          let remainingTime = Math.floor(
            (alarmInfo.scheduledTime - new Date()) / 1000
          );
          let remainingTimeSec = Math.max(remainingTime, 0);
          chrome.runtime.sendMessage({
            message: new UIUpdateMessage(
              result[CLOCK_STATUS],
              remainingTimeSec
            ),
          });
        } else {
          chrome.runtime.sendMessage({
            message: new UIUpdateMessage(result[CLOCK_STATUS], 0),
          });
        }
      });
    } else if (result[CLOCK_STATUS] == ClockStatus.Paused) {
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          result[CLOCK_STATUS],
          result[LAST_REMAINING_TIME_SEC]
        ),
      });
    } else if (result[CLOCK_STATUS] == ClockStatus.NotStarted) {
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(
          result[CLOCK_STATUS],
          result[POMODORO_TIME_SEC]
        ),
      });
    } else if (result[CLOCK_STATUS] == ClockStatus.Done) {
      chrome.runtime.sendMessage({
        message: new UIUpdateMessage(result[CLOCK_STATUS], 0),
      });
    }
  });
}

// Handle stepping Pomodoro, creating alarm, and updating Icon
