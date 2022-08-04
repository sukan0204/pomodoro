"use strict";

import { ButtonStatus, ClockStatus } from "./constants.js";
import { ButtonClickedMessage } from "./message.js";

export class Button {
  constructor(button, stopButton) {
    this.button = button;
    this.button.innerText = ButtonStatus.Start;
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
      this.button.innerText = ButtonStatus.Start;
    } else if (status === ClockStatus.Started || status === ClockStatus.Break) {
      this.button.innerText = ButtonStatus.Pause;
    } else if (status === ClockStatus.Paused) {
      this.button.innerText = ButtonStatus.Resume;
      this.stopButton.style.visibility = "visible";
    } else if (status === ClockStatus.Done) {
      this.button.innerText = ButtonStatus.Reset;
    }
  }
  clickStopButton() {
    chrome.runtime.sendMessage({
      message: new ButtonClickedMessage(ButtonStatus.Reset),
    });
    this.button.innerText = ButtonStatus.Start;
    this.stopButton.style.visibility = "hidden";
  }
  clickButton() {
    this.stopButton.style.visibility = "hidden";
    chrome.runtime.sendMessage({
      message: new ButtonClickedMessage(this.button.innerText),
    });
    switch (this.button.innerText) {
      case ButtonStatus.Start:
        this.button.innerText = ButtonStatus.Pause;
        break;
      case ButtonStatus.Resume:
        this.button.innerText = ButtonStatus.Pause;
        break;
      case ButtonStatus.Pause:
        this.button.innerText = ButtonStatus.Resume;
        this.stopButton.style.visibility = "visible";
        break;
      case ButtonStatus.Reset:
        this.button.innerText = ButtonStatus.Start;
        break;
      default:
        break;
    }
  }
}
