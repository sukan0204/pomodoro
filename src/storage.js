const Status = {
  Paused: "Paused",
  Started: "Started",
  Done: "Done",
  NotStarted: "NotStarted",
};
const CLOCK_STATUS = "ClockStatus";
const POMODORO_TIME_MIN = "PomodoroTimeMin";
//const SHORT_BREAK_MIN = "ShortBreakMin";
//const LONG_BREAK_MIN = "LongBreakMin";
//const NUM_INTERVAL = "NumInterval";
//const STEP_IDX = "StepIndex";
const CURRENT_STEP_STARTED_TIME = "CurrentStepStarted";
const LAST_REMAINING_TIME = "LastRemainingTime";

function resetClockStatus(cb) {
  chrome.storage.local.set(
    {
      [CLOCK_STATUS]: Status.NotStarted,
      [CURRENT_STEP_STARTED_TIME]: undefined,
      [LAST_REMAINING_TIME]: undefined,
    },
    () => {
      console.log("reset clock status");
      cb();
    }
  );
}

function initializeTimerConst(cb) {
  chrome.storage.local.set(
    {
      [POMODORO_TIME_MIN]: 1,
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
      POMODORO_TIME_MIN,
      CURRENT_STEP_STARTED_TIME,
      LAST_REMAINING_TIME,
    ],
    (result) => {
      console.log(`Getting timer data: ${result[POMODORO_TIME_MIN]}`);
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
  chrome.storage.local.set({
    [CURRENT_STEP_STARTED_TIME]: Date.now(),
    [LAST_REMAINING_TIME]: remainingTimeMs,
    [CLOCK_STATUS]: Status.Started,
  });
  if (cb !== undefined) {
    cb();
  }
}

function pauseTimerData(cb) {
  console.log("pauseTimerData");
  getTimerData((result) => {
    getRemainingTimeFromStorage(result, (remainingTime) => {
      chrome.storage.local.set(
        {
          [CURRENT_STEP_STARTED_TIME]: null,
          [LAST_REMAINING_TIME]: remainingTime,
          [CLOCK_STATUS]: Status.Paused,
        },
        () => {
          if (cb !== undefined) {
            console.log("pauseTimerData cb");
            cb();
          }
        }
      );
    });
  });
}

function doneTimerData(cb) {
  console.log("doneTimerData");
  chrome.storage.local.set(
    {
      [CURRENT_STEP_STARTED_TIME]: null,
      [LAST_REMAINING_TIME]: null,
      [CLOCK_STATUS]: Status.Done,
    },
    () => {
      if (cb !== undefined) {
        cb();
      }
    }
  );
}

export {
  initializeTimerConst,
  getTimerData,
  Status,
  CLOCK_STATUS,
  POMODORO_TIME_MIN,
  LAST_REMAINING_TIME,
  getRemainingTimeFromStorage,
  startTimerData,
  pauseTimerData,
  doneTimerData,
  resetClockStatus,
};
