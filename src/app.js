'use strict';

import getDay from './day';
import {setTimer, getTimer, updateTimer} from './clock.js';
import './app.css';

(function() {
  let started = false;
  let button = document.getElementById('button');
  let currentInterval;
  button.innerText = "Start";
  button.addEventListener("click", clickButton);

  function setDay() {
    const day = getDay();

    document.getElementById('day').innerHTML = day;
  }

  function showTimer() {
    let currentTime = getTimer();
    let min = Math.floor(currentTime / 60);
    let sec = currentTime % 60;
    let remainingTime = `${min}:`+`${sec}`.padStart(2, '0');
    if (currentTime === 0) {
      clearInterval(currentInterval);
    }
    document.getElementById('pomodoro_clock').innerHTML = remainingTime;
  }

  function clickButton() {
    if (started) {
      button.innerText = "Start";
      started = false;
      clearInterval(currentInterval);
    }
    else {
      button.innerText = "Pause";
      started = true;
      currentInterval = setInterval(updateTimer, 1000);
    }
  }

  function setupDashboard() {
    setDay();
    showTimer();
    setInterval(setDay, 1000);
    setInterval(showTimer, 1000);
  }

  setupDashboard();

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Ove. I am from Override app.',
      },
    },
    response => {
      console.log(response.message);
    }
  );
})();
