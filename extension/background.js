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

// Listener for when a tab is activated
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (isYouTubeUrl(tab.url)) {
            console.log(`Injecting content script into activated tab: ${tab.url}`);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['contentScript.js']
            }).then(() => {
                console.log(`Content script injected into activated tab: ${tab.url}`);
            }).catch(err => {
                console.error(`Failed to inject content script into activated tab: ${tab.url}`, err);
            });
        }
    });
});

// Listener for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetch_audio') {
        const videoUrl = message.videoUrl;
        console.log(`Fetching audio for URL: ${videoUrl}`);

        // Call your Flask server to get the audio data
        fetch(`https://summytservice-3vj7v3emia-lm.a.run.app/download?url=${encodeURIComponent(videoUrl)}`)
            .then(response => response.json())
            .then(data => {
                if (data.audioUrl) {
                    fetch(data.audioUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            // Convert the blob to a base64 string
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64data = reader.result;
                                sendResponse({ audioData: base64data });
                            };
                            reader.readAsDataURL(blob);
                        })
                        .catch(error => {
                            console.error('Error fetching audio data:', error);
                            sendResponse({ error: 'Error fetching audio data.' });
                        });
                } else {
                    console.error('Error in server response:', data);
                    sendResponse({ error: 'Error in server response.' });
                }
            })
            .catch(error => {
                console.error('Error calling Flask server:', error);
                sendResponse({ error: 'Error calling Flask server.' });
            });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

console.log("Background script loaded.");
