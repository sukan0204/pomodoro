const Status = {
  Paused: "Paused",
  Started: "Started",
  Done: "Done",
  NotStarted: "NotStarted",
  Break: "Break",
};
const CLOCK_STATUS = "ClockStatus";
const POMODORO_TIME_SEC = "PomodoroTimeSec";
const SHORT_BREAK_SEC = "ShortBreakSec";
const LONG_BREAK_SEC = "LongBreakSec";
const NUM_INTERVAL = "NumInterval";
const STEP_IDX = "StepIndex";
const CURRENT_STEP_STARTED_TIME = "CurrentStepStarted";
const LAST_REMAINING_TIME = "LastRemainingTime";

function getNextStep(result) {
  let nextStep = result[STEP_IDX] + 1;

  let numInterval = result[NUM_INTERVAL];
  if (nextStep == 2 * numInterval) {
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
      status: Status.Rest,
      remainingTime:
        nextStep < 2 * numInterval - 1
          ? result[SHORT_BREAK_SEC]
          : result[LONG_BREAK_SEC],
      step: nextStep,
    };
  }
}

function resetClockStatus(cb) {
  let data = {
    [CLOCK_STATUS]: Status.NotStarted,
    [CURRENT_STEP_STARTED_TIME]: undefined,
    [LAST_REMAINING_TIME]: undefined,
  };
  chrome.storage.local.set(data, () => {
    console.log("reset clock status");
    cb(data);
  });
}

function initializeTimerConst(cb) {
  chrome.storage.local.set(
    {
      [POMODORO_TIME_SEC]: 15,
      [SHORT_BREAK_SEC]: 5,
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
      LAST_REMAINING_TIME,
    ],
    (result) => {
      console.log(`Getting timer data: ${result[POMODORO_TIME_SEC]}`);
      cb(result);
    }
  );
}

function getRemainingTimeFromStorage(result, cb) {
  let remainingTime;
  if (result[CLOCK_STATUS] === Status.Paused) {
    remainingTime = result[LAST_REMAINING_TIME];
  } else if (result[CLOCK_STATUS] == Status.Started) {
    let lastStarted = result[CURRENT_STEP_STARTED_TIME];
    let now = Date.now();
    let elapsed = now - lastStarted;
    remainingTime = result[LAST_REMAINING_TIME] - elapsed;
  }
  console.log(`Remaining Time: ${remainingTime}`);
  cb(remainingTime);
}

function startTimerData(remainingTimeMs, cb) {
  console.log(`start timer: ${remainingTimeMs}`);
  let data = {
    [CURRENT_STEP_STARTED_TIME]: Date.now(),
    [LAST_REMAINING_TIME]: remainingTimeMs,
    [CLOCK_STATUS]: Status.Started,
  };
  chrome.storage.local.set(data);
  if (cb !== undefined) {
    cb(data);
  }
}

function pauseTimerData(cb) {
  console.log("pauseTimerData");
  getTimerData((result) => {
    getRemainingTimeFromStorage(result, (remainingTime) => {
      let data = {
        [CURRENT_STEP_STARTED_TIME]: null,
        [LAST_REMAINING_TIME]: remainingTime,
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

function doneTimerData(cb) {
  console.log("doneTimerData");
  let data = {
    [CURRENT_STEP_STARTED_TIME]: null,
    [LAST_REMAINING_TIME]: null,
    [CLOCK_STATUS]: Status.Done,
  };
  chrome.storage.local.set(data, () => {
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
  LAST_REMAINING_TIME,
  getRemainingTimeFromStorage,
  startTimerData,
  pauseTimerData,
  doneTimerData,
  resetClockStatus,
};
