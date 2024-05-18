function addSummarizeButton() {
    const videoTitles = document.querySelectorAll('#video-title');
  
    videoTitles.forEach(title => {
      if (!title.parentElement.querySelector('.summarize-button')) {
        const button = document.createElement('button');
        button.innerText = 'Summarize';
        button.className = 'summarize-button';
        button.style.marginLeft = '10px';
        button.addEventListener('click', () => {
          alert('Summarize button clicked!');
          // You can add the code to handle summarizing the video here
        });
  
        title.parentElement.appendChild(button);
      }
    });
  }
  
  function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        addSummarizeButton();
      });
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    addSummarizeButton();
    observeDOMChanges();
  });
  