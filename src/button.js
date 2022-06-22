"use strict";

import { startTimer, updateTimer, resetTimer, pauseTimer } from "./clock.js";
import {
  Status as ClockStatus,
  getTimerData,
  POMODORO_TIME_SEC,
  getRemainingTimeFromStorage,
} from "./storage.js";

const Status = {
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
  }

  set(status) {
    console.log(`clock status for button ${status}`);
    this.stopButton.style.visibility = "hidden";
    if (status === ClockStatus.NotStarted || status === undefined) {
      this.button.innerText = Status.Start;
    } else if (status === ClockStatus.Started || status === ClockStatus.Rest) {
      this.button.innerText = Status.Pause;
    } else if (status === ClockStatus.Paused) {
      this.button.innerText = Status.Resume;
      this.stopButton.style.visibility = "visible";
    } else if (status === ClockStatus.Done) {
      this.button.innerText = Status.Reset;
    }
    this.button.addEventListener("click", () => {
      this.clickButton();
    });
    this.stopButton.addEventListener("click", () => {
      this.clickStopButton();
    });
  }
  setDone() {
    console.log("setDone");
    this.button.innerText = Status.Reset;
    this.stopButton.style.visibility = "hidden";
  }
  clickStopButton() {
    resetTimer(updateTimer);
    this.button.innerText = Status.Start;
    this.stopButton.style.visibility = "hidden";
  }
  clickButton() {
    this.stopButton.style.visibility = "hidden";
    switch (this.button.innerText) {
      case Status.Start:
        this.button.innerText = Status.Pause;
        getTimerData((result) => {
          startTimer(result[POMODORO_TIME_SEC] * 1000, () => {
            this.setDone();
          });
        });
        break;
      case Status.Resume:
        this.button.innerText = Status.Pause;
        getTimerData((result) => {
          getRemainingTimeFromStorage(result, (remainingTime) => {
            if (remainingTime == null) {
              this.setDone();
            }
            if (remainingTime > 0) {
              startTimer(remainingTime, () => {
                this.setDone();
              });
            }
          });
        });
        break;
      case Status.Pause:
        this.button.innerText = Status.Resume;
        this.stopButton.style.visibility = "visible";
        pauseTimer(updateTimer);
        break;
      case Status.Reset:
        resetTimer(updateTimer);
        this.button.innerText = Status.Start;
        break;
      default:
        break;
    }
  }
}
