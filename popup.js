document.getElementById('extract').addEventListener('click', function() {
    // Send message to background script to initiate extraction
    chrome.runtime.sendMessage({ action: 'extractData' });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'displayData') {
        document.getElementById('dataBox').value = message.data;
    }
});
