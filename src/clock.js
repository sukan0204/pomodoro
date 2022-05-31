'use strict';

const DEFAULT_TIME = 1*60;
let remainingTimeSec = DEFAULT_TIME;

function updateTimer() {
  if (remainingTimeSec > 0) {
    remainingTimeSec -= 1;
  }
}

function setTimer(duration=DEFAULT_TIME) {
  remainingTimeSec = duration;
}

function getTimer(){
  return remainingTimeSec;
}

export {setTimer, getTimer, updateTimer};
