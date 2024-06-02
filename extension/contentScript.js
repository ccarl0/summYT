// Logging function for debugging
function log(level, message, data = null) {
    const logMessage = `[summYT][${level}] ${message}`;
    if (data) {
        console[level](logMessage, data);
    } else {
        console[level](logMessage);
    }
}

// Function to inject buttons into visible video thumbnails
function injectButtons() {
    // Select visible thumbnail elements on the screen
    const thumbnails = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer');

    if (thumbnails.length === 0) {
        log('info', "No visible thumbnails found.");
        return;
    }

    thumbnails.forEach(thumbnail => {
        // Check if the "summYT" button already exists
        if (thumbnail.querySelector('.summYT-button')) return;

        // Create a button element
        const button = document.createElement('button');
        button.textContent = 'summYT';
        button.classList.add('summYT-button');
        button.style.cursor = 'pointer';

        // Add click event listener to the button
        button.addEventListener('click', () => {
            // Get the URL of the video
            const videoUrl = thumbnail.querySelector('a#thumbnail').href;

            // Create a popup with a loader
            const popup = document.createElement('div');
            popup.classList.add('summYT-popup');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.backgroundColor = 'white';
            popup.style.border = '1px solid #ccc';
            popup.style.padding = '20px';
            popup.style.zIndex = '10000';
            popup.style.fontSize = '16px'; // Make the text larger
            popup.innerHTML = '<div>Loading summary...</div>';

            document.body.appendChild(popup);

            log('info', `Fetching summary for video URL: ${videoUrl}`);
            
            // Send a message to the background script to fetch the video summary
            chrome.runtime.sendMessage({ type: 'fetch_summary', videoUrl }, response => {
                if (response && response.summary) {
                    popup.innerHTML = `<div>${response.summary}</div>`;
                    log('info', `Summary received for video URL: ${videoUrl}`);
                } else {
                    popup.innerHTML = `<div>Error: ${response.error}</div>`;
                    log('error', `Failed to retrieve summary for video URL: ${videoUrl}`, response.error);
                }

                // Add a close button to the popup
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.style.marginTop = '10px';
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(popup);
                });
                popup.appendChild(closeButton);
            });
        });

        // Get the parent element of the thumbnail
        const parentElement = thumbnail.querySelector('#dismissible');

        if (parentElement) {
            // Create a div to contain the button
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '5px'; // Adjust margin as needed

            // Append the button to the container
            buttonContainer.appendChild(button);

            // Append the container under the parent element
            parentElement.appendChild(buttonContainer);
        }
    });
}

// Call the function to inject buttons when the script is loaded
injectButtons();

// Check if observer is already declared to avoid redeclaration
if (typeof observer === 'undefined') {
    // Listen for changes in the page content and re-inject buttons as necessary
    const observer = new MutationObserver(() => {
        injectButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    log('info', "Content script loaded and observer set.");
} else {
    log('info', "Observer is already defined.");
}