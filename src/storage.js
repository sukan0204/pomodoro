const Status = {
  Paused: "Paused",
  Started: "Started",
  Done: "Done",
  NotStarted: "NotStarted",
  Break: "Break",
};
// Static Data
const POMODORO_TIME_SEC = "PomodoroTimeSec";
const SHORT_BREAK_SEC = "ShortBreakSec";
const LONG_BREAK_SEC = "LongBreakSec";
const NUM_INTERVAL = "NumInterval";

// Frequently Updated
const CLOCK_STATUS = "ClockStatus";
const STEP_IDX = "StepIndex";
const CURRENT_STEP_STARTED_TIME = "CurrentStepStarted";
const LAST_REMAINING_TIME_SEC = "LastRemainingTime";

function _getCurrentStep(result) {
  let step = result[STEP_IDX];
  let numInterval = result[NUM_INTERVAL];
  if (step >= 2 * numInterval) {
    return {
      status: Status.Done,
      remainingTime: 0,
      step: step,
    };
  } else if (step % 2 == 0) {
    return {
      status: Status.Started,
      remainingTime: result[POMODORO_TIME_SEC],
      step: step,
    };
  } else {
    return {
      status: Status.Break,
      remainingTime:
        step < 2 * numInterval - 1
          ? result[SHORT_BREAK_SEC]
          : result[LONG_BREAK_SEC],
      step: step,
    };
  }
}

function _getNextStep(result) {
  let nextStep = result[STEP_IDX] + 1;

  let numInterval = result[NUM_INTERVAL];
  if (nextStep >= 2 * numInterval) {
    return {
      status: Status.Done,
      remainingTime: 0,
      step: nextStep,
    };
  } else if (nextStep % 2 == 0) {
    return {
      status: Status.Started,
      remainingTime: result[POMODORO_TIME_SEC],
      step: nextStep,
    };
  } else {
    return {
      status: Status.Break,
      remainingTime:
        nextStep < 2 * numInterval - 1
          ? result[SHORT_BREAK_SEC]
          : result[LONG_BREAK_SEC],
      step: nextStep,
    };
  }
}

function stepNext(result, cb) {
  console.log("step next");
  let nextStep = _getNextStep(result);
  let data = {
    [CURRENT_STEP_STARTED_TIME]: Date.now(),
    [LAST_REMAINING_TIME_SEC]: nextStep["remainingTime"],
    [CLOCK_STATUS]: nextStep["status"],
    [STEP_IDX]: nextStep["step"],
  };
  chrome.storage.local.set(data);
  if (cb !== undefined) {
    cb(data);
  }
}

function initializeTimerConst() {
  chrome.storage.local.set(
    {
      [POMODORO_TIME_SEC]: 5,
      [SHORT_BREAK_SEC]: 3,
      [LONG_BREAK_SEC]: 10,
      [NUM_INTERVAL]: 2, // pomodoro, short break, pomodoro, long break
    },
    () => {
      console.log("initialize timer");
    }
  );
}

function getTimerData(cb) {
  chrome.storage.local.get(
    [
      CLOCK_STATUS,
      POMODORO_TIME_SEC,
      SHORT_BREAK_SEC,
      LONG_BREAK_SEC,
      NUM_INTERVAL,
      STEP_IDX,
      CURRENT_STEP_STARTED_TIME,
      LAST_REMAINING_TIME_SEC,
    ],
    (result) => {
      console.log(`Getting timer data: ${result[POMODORO_TIME_SEC]}`);
      cb(result);
    }
  );
}

function initiateTimerData(remainingTimeSec, cb) {
  console.log(`initiate timer: ${remainingTimeSec}`);
  let data = {
    [CURRENT_STEP_STARTED_TIME]: Date.now(),
    [LAST_REMAINING_TIME_SEC]: remainingTimeSec,
    [CLOCK_STATUS]: Status.Started,
    [STEP_IDX]: 0,
  };
  chrome.storage.local.set(data);
  if (cb !== undefined) {
    cb(data);
  }
}

function resumeTimerData(cb) {
  //console.log(`resume timer: ${remainingTimeSec}`);
  getTimerData((result) => {
    let status = _getCurrentStep(result);
    console.log(status);
    let data = {
      [CURRENT_STEP_STARTED_TIME]: Date.now(),
      [CLOCK_STATUS]: status["status"],
    };
    console.log("setting resume timer data");
    console.log(data);
    chrome.storage.local.set(data);
    if (cb !== undefined) {
      cb({ ...result, ...data });
    }
  });
}

function pauseTimerData(cb) {
  console.log("pauseTimerData");
  getTimerData((result) => {
    getRemainingTimeFromStorage(result, (remainingTime) => {
      let data = {
        [CURRENT_STEP_STARTED_TIME]: null,
        [LAST_REMAINING_TIME_SEC]: remainingTime,
        [CLOCK_STATUS]: Status.Paused,
      };
      chrome.storage.local.set(data, () => {
        if (cb !== undefined) {
          console.log("pauseTimerData cb");
          cb(data);
        }
      });
    });
  });
}

function getRemainingTimeFromStorage(result, cb) {
  let remainingTime;
  if (result[CLOCK_STATUS] === Status.Paused) {
    remainingTime = result[LAST_REMAINING_TIME_SEC];
  } else if (
    result[CLOCK_STATUS] == Status.Started ||
    result[CLOCK_STATUS] == Status.Break
  ) {
    let lastStarted = result[CURRENT_STEP_STARTED_TIME];
    let now = Date.now();
    let elapsed = Math.floor((now - lastStarted) / 1000);
    remainingTime = result[LAST_REMAINING_TIME_SEC] - elapsed;
  }
  console.log(`Remaining Time: ${remainingTime}`);
  cb(remainingTime);
}

function resetClockStatus(cb) {
  let data = {
    [CLOCK_STATUS]: Status.NotStarted,
    [CURRENT_STEP_STARTED_TIME]: undefined,
    [LAST_REMAINING_TIME_SEC]: undefined,
    [STEP_IDX]: 0,
  };
  chrome.storage.local.set(data, () => {
    console.log("reset clock status");
    if (cb !== undefined) {
      cb(data);
    }
  });
}

export {
  initializeTimerConst,
  getTimerData,
  Status,
  CLOCK_STATUS,
  POMODORO_TIME_SEC,
  LAST_REMAINING_TIME_SEC,
  getRemainingTimeFromStorage,
  pauseTimerData,
  resetClockStatus,
  initiateTimerData,
  resumeTimerData,
  stepNext,
};
