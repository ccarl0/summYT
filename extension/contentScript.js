// Function to inject buttons into visible video thumbnails
function injectButtons() {
    // Select visible thumbnail elements on the screen
    const thumbnails = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer');

    if (thumbnails.length === 0) {
        console.log("No visible thumbnails found.");
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

            // Send a message to the background script to fetch audio data
            chrome.runtime.sendMessage({ type: 'fetch_audio', videoUrl }, response => {
                if (response && response.audioData) {
                    const audioData = response.audioData;
                    console.log('Audio data received:', audioData);
                    // You can now use this audio data for further processing
                } else {
                    console.error('Failed to retrieve audio data:', response.error);
                }
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

    console.log("Content script loaded and observer set.");
} else {
    console.log("Observer is already defined.");
}
