function playMusic() {
  let path = chrome.runtime.getURL("assets/mixkit-service-bell-931.wav");
  console.log(path);
  let ding = new Audio(path);
  ding.play();
}

export { playMusic };
