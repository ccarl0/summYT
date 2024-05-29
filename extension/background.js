// background.js

// Function to check if the URL is a YouTube URL
function isYouTubeUrl(url) {
    return url && url.includes('youtube.com');
}

// Listener for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && isYouTubeUrl(tab.url)) {
        console.log(`Injecting content script into updated tab: ${tab.url}`);
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['contentScript.js']
        }).then(() => {
            console.log(`Content script injected into updated tab: ${tab.url}`);
        }).catch(err => {
            console.error(`Failed to inject content script into updated tab: ${tab.url}`, err);
        });
    }
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetch_audio') {
        const videoUrl = message.videoUrl;
        console.log(`Fetching audio for URL: ${videoUrl}`);

        // Call your Flask server to get the audio data
        fetch(`https://summytservice-3vj7v3emia-lm.a.run.app/download?url=${encodeURIComponent(videoUrl)}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok.');
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    sendResponse({ audioData: reader.result });
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error fetching audio data:', error);
                sendResponse({ error: 'Error fetching audio data.' });
            });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

console.log("Background script loaded.");
