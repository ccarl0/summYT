// background.js

// Logging function for debugging
function log(level, message, data = null) {
    const logMessage = `[summYT][${level}] ${message}`;
    if (data) {
        console[level](logMessage, data);
    } else {
        console[level](logMessage);
    }
}

// Function to check if the URL is a YouTube URL
function isYouTubeUrl(url) {
    return url && url.includes('youtube.com');
}

// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isYouTubeUrl(tab.url)) {
        log('info', `Injecting content script into updated tab: ${tab.url}`);
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['contentScript.js']
        }).then(() => {
            log('info', `Content script injected into updated tab: ${tab.url}`);
        }).catch(err => {
            log('error', `Failed to inject content script into updated tab: ${tab.url}`, err);
        });
    }
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetch_summary') {
        const videoUrl = message.videoUrl;
        log('info', `Fetching summary for URL: ${videoUrl}`);

        // Call your Flask server to get the video summary
        fetch(`https://smyt-oai-5wd6clijxa-og.a.run.app/download?url=${encodeURIComponent(videoUrl)}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok.');
                return response.json();
            })
            .then(data => {
                log('info', `Summary fetched for URL: ${videoUrl}`);
                sendResponse({ summary: data.summary });
            })
            .catch(error => {
                log('error', `Error fetching summary for URL: ${videoUrl}`, error);
                sendResponse({ error: 'Error fetching summary.' });
            });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

log('info', 'Background script loaded.');