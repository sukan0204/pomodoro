"use strict";

import { Status } from "./storage.js";

export class Clock {
  constructor(clock_element) {
    this.clock_element = clock_element;
    this.remainingTime = null;
    this.currentInterval = null;
  }

  setUp(clock_status, remainingTimeSec) {
    clearInterval(this.currentInterval);
    this.set(remainingTimeSec);
    if (clock_status == Status.Started || clock_status == Status.Break) {
      remainingTimeSec -= 1;
      this.currentInterval = setInterval(() => {
        if (remainingTimeSec < 0) {
          clearInterval(this.currentInterval);
          return;
        }
        this.set(remainingTimeSec);
        remainingTimeSec -= 1;
      }, 1000);
    }
  }

  set(remainingTimeSec) {
    this.remainingTime = remainingTimeSec;
    let min = Math.floor(this.remainingTime / 60);
    let sec = this.remainingTime % 60;
    let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
    this.clock_element.innerHTML = remainingTimeText;
  }
}
