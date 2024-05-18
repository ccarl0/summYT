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
  
  console.log("Background script loaded.");
  