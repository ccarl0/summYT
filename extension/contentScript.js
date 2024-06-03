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
        button.style.marginRight = '8px'; // Add some margin to the right of the button
        button.style.backgroundColor = '#cc0000'; // YouTube's button color
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '2px';
        button.style.padding = '10px 16px';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.textTransform = 'uppercase';

        // Add click event listener to the button
        button.addEventListener('click', () => {
            // Get the URL of the video
            const videoUrl = thumbnail.querySelector('a#thumbnail').href;

            // Find or create a container for the summary
            let summaryContainer = thumbnail.querySelector('.summYT-summary');
            if (!summaryContainer) {
                summaryContainer = document.createElement('p');
                summaryContainer.classList.add('summYT-summary');
                summaryContainer.style.marginTop = '10px';
                summaryContainer.style.padding = '10px';
                summaryContainer.style.backgroundColor = '#f9f9f9';
                summaryContainer.style.border = '1px solid #ccc';
                summaryContainer.style.borderRadius = '4px';
                summaryContainer.style.fontSize = '14px'; // Similar to YouTube's font size
                summaryContainer.style.color = '#333';

                // Insert the summary container after the button
                button.after(summaryContainer);
            }

            // Show a loading message
            summaryContainer.textContent = 'Loading summary...';

            log('info', `Fetching summary for video URL: ${videoUrl}`);
            
            // Send a message to the background script to fetch the video summary
            chrome.runtime.sendMessage({ type: 'fetch_summary', videoUrl }, response => {
                if (response && response.summary) {
                    summaryContainer.textContent = response.summary;
                    log('info', `Summary received for video URL: ${videoUrl}`);
                } else {
                    summaryContainer.textContent = `Error: ${response.error}`;
                    log('error', `Failed to retrieve summary for video URL: ${videoUrl}`, response.error);
                }
            });
        });

        // Get the parent element of the thumbnail
        const parentElement = thumbnail.querySelector('#dismissible');

        if (parentElement) {
            // Create a div to contain the button
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '5px'; // Adjust margin as needed
            buttonContainer.style.display = 'flex';
            buttonContainer.style.alignItems = 'center';

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
