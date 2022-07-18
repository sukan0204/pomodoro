"use strict";

import { startTimer, updateTimer, resetTimer, pauseTimer } from "./clock.js";
import {
  Status as ClockStatus,
  getTimerData,
  POMODORO_TIME_SEC,
} from "./storage.js";

export const Status = {
  Start: "Start",
  Pause: "Pause",
  Resume: "Resume",
  Reset: "Reset",
};

export class Button {
  constructor(button, stopButton) {
    this.button = button;
    this.button.innerText = Status.Start;
    this.button_status = Status.Pause;
    this.stopButton = stopButton;
    this.button.addEventListener("click", () => {
      this.clickButton();
    });
    this.stopButton.addEventListener("click", () => {
      this.clickStopButton();
    });
  }

  set(status) {
    this.stopButton.style.visibility = "hidden";
    if (status === ClockStatus.NotStarted || status === undefined) {
      this.button.innerText = Status.Start;
    } else if (status === ClockStatus.Started || status === ClockStatus.Break) {
      this.button.innerText = Status.Pause;
    } else if (status === ClockStatus.Paused) {
      this.button.innerText = Status.Resume;
      this.stopButton.style.visibility = "visible";
    } else if (status === ClockStatus.Done) {
      this.button.innerText = Status.Reset;
    }
  }
  clickStopButton() {
    chrome.runtime.sendMessage({ type: Status.Reset });
    this.button.innerText = Status.Start;
    this.stopButton.style.visibility = "hidden";
  }
  clickButton() {
    this.stopButton.style.visibility = "hidden";
    chrome.runtime.sendMessage({ type: this.button.innerText });
    switch (this.button.innerText) {
      case Status.Start:
        this.button.innerText = Status.Pause;
        break;
      case Status.Resume:
        this.button.innerText = Status.Pause;
        break;
      case Status.Pause:
        this.button.innerText = Status.Resume;
        this.stopButton.style.visibility = "visible";
        break;
      case Status.Reset:
        this.button.innerText = Status.Start;
        break;
      default:
        break;
    }
  }
}
