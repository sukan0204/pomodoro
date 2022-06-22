import {
  Status as ClockStatus,
  CLOCK_STATUS,
  LAST_REMAINING_TIME,
} from "./storage.js";

function setActiveIcon() {
  chrome.action.setIcon({
    path: "icons/icons8-cherry-tomato-60-active.png",
  });
  chrome.action.setBadgeText({
    text: "",
  });
}

function setPausedIcon(remainingTimeMs) {
  chrome.action.setIcon({
    path: "icons/icons8-cherry-tomato-60-paused.png",
  });
  let remainingTimeSec = Math.floor(remainingTimeMs / 1000);
  let min = Math.floor(remainingTimeSec / 60);
  let sec = remainingTimeSec % 60;
  let remainingTimeText = `${min}:` + `${sec}`.padStart(2, "0");
  chrome.action.setBadgeText({
    text: remainingTimeText,
  });
}

function setRestIcon() {
  chrome.action.setIcon({
    path: "icons/icons8-cherry-tomato-60-rest.png",
  });
}

function setDoneIcon() {
  chrome.action.setIcon({
    path: "icons/icons8-cherry-tomato-60-inactive.png",
  });
  chrome.action.setBadgeText({
    text: "Done",
  });
}

function setInactiveIcon() {
  chrome.action.setIcon({
    path: "icons/icons8-cherry-tomato-60-inactive.png",
  });
  chrome.action.setBadgeText({
    text: "",
  });
}

function setIconStatus(result) {
  let status = result[CLOCK_STATUS];
  if (status === ClockStatus.NotStarted || status === undefined) {
    setInactiveIcon();
  } else if (status === ClockStatus.Started) {
    setActiveIcon();
  } else if (status === ClockStatus.Paused) {
    setPausedIcon(result[LAST_REMAINING_TIME]);
  } else if (status === ClockStatus.Done) {
    setDoneIcon();
  } else if (status === ClockStatus.Break) {
    setRestIcon();
  }
}

export { setIconStatus };
