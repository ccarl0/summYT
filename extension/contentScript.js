// Function to print video titles and add buttons
function printVisibleVideoTitles() {
  // Select thumbnail elements that are currently visible on the screen
  const visibleThumbnails = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer');

  if (visibleThumbnails.length === 0) {
      console.log("No visible thumbnails found.");
  } else {
      visibleThumbnails.forEach(thumbnailElement => {
          // Check if the "summYT" button already exists
          if (thumbnailElement.querySelector('.summYT-button')) return;

          // Create a button element
          const button = document.createElement('button');
          button.textContent = 'summYT'; // Set button text
          button.classList.add('summYT-button'); // Add a class for styling
          button.style.cursor = 'pointer'; // Change cursor to pointer on hover

          // Add click event listener to the button
          button.addEventListener('click', () => {
              // Get the URL of the video
              const videoUrl = thumbnailElement.querySelector('a#thumbnail').href;

              // Send a message to the background script to fetch audio data
              chrome.runtime.sendMessage({ type: 'fetch_audio', videoUrl }, (response) => {
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
          const parentElement = thumbnailElement.querySelector('#dismissible');

          if (!parentElement) return; // Ensure parent element exists

          // Create a div to contain the button
          const buttonContainer = document.createElement('div');
          buttonContainer.style.marginTop = '5px'; // Adjust margin as needed

          // Append the button to the container
          buttonContainer.appendChild(button);

          // Append the container under the parent element
          parentElement.appendChild(buttonContainer);
      });
  }
}

// Call the function to print video titles when the script is loaded
printVisibleVideoTitles();

// Optional: Listen for changes in the page content and re-run the function
const observer = new MutationObserver(() => {
  printVisibleVideoTitles();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log("Content script loaded and observer set.");
