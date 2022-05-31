document.getElementById('openTab').addEventListener('click', () => {
    console.log("here");
    chrome.tabs.create({});
});
