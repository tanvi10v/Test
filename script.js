document.addEventListener('DOMContentLoaded', () => {
    const paragraphs = document.querySelectorAll('.content-container p');
    const talkBubbleTemplate = document.getElementById('talkBubbleTemplate');
    const contentContainer = document.querySelector('.content-container'); // or document.body

    // Function to remove any existing talk bubble
    const removeExistingTalkBubble = () => {
        const existingBubble = document.querySelector('.talk-bubble-instance');
        if (existingBubble) {
            existingBubble.remove();
        }
    };

    paragraphs.forEach(paragraph => {
        paragraph.addEventListener('click', (event) => {
            removeExistingTalkBubble(); // Remove any bubble that's already open

            const clickedParagraph = event.currentTarget;
            const paragraphRect = clickedParagraph.getBoundingClientRect();

            // Clone the template
            const clonedBubble = talkBubbleTemplate.cloneNode(true);
            clonedBubble.id = `talk-bubble-for-${clickedParagraph.id}`;
            clonedBubble.classList.add('talk-bubble-instance'); // Add class to identify cloned bubbles
            
            // Add placeholder content
            const conversationContent = clonedBubble.querySelector('.conversation-content');
            if (conversationContent) {
                conversationContent.textContent = `Conversation for ${clickedParagraph.id}.`;
            }

            // Position the bubble
            // Position below the paragraph, aligning left edges
            // window.scrollY is added to account for page scrolling
            clonedBubble.style.position = 'absolute'; // Ensure it's absolute for getBoundingClientRect
            clonedBubble.style.top = `${paragraphRect.bottom + window.scrollY + 5}px`; // 5px offset
            clonedBubble.style.left = `${paragraphRect.left + window.scrollX}px`;
            
            // Make it visible
            clonedBubble.style.display = 'block';

            // Append to the body or a specific container
            document.body.appendChild(clonedBubble);

            // Add event listener to its close button
            const closeButton = clonedBubble.querySelector('.close-bubble');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    clonedBubble.remove();
                });
            }
        });
    });
});
