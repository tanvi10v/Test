document.addEventListener('DOMContentLoaded', () => {
    const paragraphs = document.querySelectorAll('.content-container p'); // Keep for now, might be used later or cleaned up
    const talkBubbleTemplate = document.getElementById('talkBubbleTemplate');
    const contentContainer = document.querySelector('.content-container');
    const selectionTriggerButton = document.getElementById('selection-trigger');

    // Function to remove any existing talk bubble
    const removeExistingTalkBubble = () => {
        const existingBubble = document.querySelector('.talk-bubble-instance');
        if (existingBubble) {
            existingBubble.remove();
        }
    };

    if (contentContainer && selectionTriggerButton) {
        contentContainer.addEventListener('mousedown', () => {
            // Hide the trigger button on any mousedown inside the container
            // This helps if the user clicks away from a selection or starts a new selection
            selectionTriggerButton.style.display = 'none';
        });

        contentContainer.addEventListener('mouseup', (event) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            // Ensure the selection is not empty and is within the content container
            if (selectedText !== '' && 
                selection.anchorNode && contentContainer.contains(selection.anchorNode) &&
                selection.focusNode && contentContainer.contains(selection.focusNode)) {
                
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Position the button slightly below and centered at the right end of the selection
                let top = rect.bottom + window.scrollY + 5; // 5px below the selection
                let left = rect.left + window.scrollX + (rect.width / 2) - (selectionTriggerButton.offsetWidth / 2); // Centered with the selection

                // Adjust if the button goes off-screen (simple horizontal check)
                const containerRect = contentContainer.getBoundingClientRect();
                const triggerRightEdge = left + selectionTriggerButton.offsetWidth;
                if (triggerRightEdge > containerRect.right + window.scrollX) {
                    left = containerRect.right + window.scrollX - selectionTriggerButton.offsetWidth - 5; // Place it 5px from the container edge
                }
                if (left < containerRect.left + window.scrollX) {
                    left = containerRect.left + window.scrollX + 5; // Place it 5px from the container edge
                }


                selectionTriggerButton.style.top = `${top}px`;
                selectionTriggerButton.style.left = `${left}px`;
                selectionTriggerButton.style.display = 'block';
                selectionTriggerButton.dataset.selectedText = selectedText;
                selectionTriggerButton.dataset.selectedRange = JSON.stringify({
                    startContainerPath: getPathTo(range.startContainer),
                    startOffset: range.startOffset,
                    endContainerPath: getPathTo(range.endContainer),
                    endOffset: range.endOffset
                });


            } else {
                // If no text is selected or selection is outside, hide the button
                // This case is also handled by mousedown, but mouseup without selection should also hide it
                selectionTriggerButton.style.display = 'none';
            }
        });

        selectionTriggerButton.addEventListener('click', () => {
            selectionTriggerButton.style.display = 'none'; // a. Hide trigger button
            removeExistingTalkBubble(); // b. Remove any existing bubble

            // c. Clone the template
            const clonedBubble = talkBubbleTemplate.cloneNode(true);
            // d. Assign unique ID and class
            clonedBubble.id = `talk-bubble-for-selection-${Date.now()}`;
            clonedBubble.classList.add('talk-bubble-instance');

            // e. Position the bubble
            const triggerRect = selectionTriggerButton.getBoundingClientRect();
            const triggerTop = triggerRect.top + window.scrollY;
            const triggerLeft = triggerRect.left + window.scrollX;
            
            clonedBubble.style.position = 'absolute'; // Ensure it's absolute for positioning
            clonedBubble.style.top = `${triggerTop + triggerRect.height + 5}px`; // 5px below the trigger
            clonedBubble.style.left = `${triggerLeft}px`; // Align left with trigger

            // f. Pre-fill with selected text
            const selectedText = selectionTriggerButton.dataset.selectedText;
            const conversationContent = clonedBubble.querySelector('.conversation-content');
            if (selectedText && conversationContent) {
                const quoteElement = document.createElement('blockquote');
                quoteElement.textContent = selectedText;
                conversationContent.appendChild(quoteElement);
            }

            // g. Clear the user-input field
            const userInput = clonedBubble.querySelector('.user-input');
            if (userInput) {
                userInput.value = '';
            }

            // h. Set up the 'Send' button listener
            const sendButton = clonedBubble.querySelector('.send-button');
            if (sendButton && userInput && conversationContent) {
                sendButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    const messageText = userInput.value.trim();
                    if (messageText !== '') {
                        const messageElement = document.createElement('p');
                        messageElement.textContent = messageText;
                        messageElement.classList.add('user-message');
                        conversationContent.appendChild(messageElement);
                        userInput.value = '';
                        conversationContent.scrollTop = conversationContent.scrollHeight;
                    }
                });
            }

            // i. Set up the 'Close' button listener
            const closeButton = clonedBubble.querySelector('.close-bubble');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    clonedBubble.remove();
                });
            }

            // j. Append clonedBubble to document.body
            document.body.appendChild(clonedBubble);
            
            // k. Make clonedBubble visible
            clonedBubble.style.display = 'block';
        });
    }

    // Helper function to get a CSS selector path to an element (for storing range)
    function getPathTo(element) {
        if (element.id !== '') return 'id("' + element.id + '")';
        if (element === document.body) return element.tagName.toLowerCase();

        let ix = 0;
        const siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
        }
    }


    // Commented out paragraph click logic (from previous tasks)
    // paragraphs.forEach(paragraph => {
    //     paragraph.addEventListener('click', (event) => {
    //         removeExistingTalkBubble(); // Remove any bubble that's already open
    //
    //         const clickedParagraph = event.currentTarget;
    //         const paragraphRect = clickedParagraph.getBoundingClientRect();
    //
    //         // Clone the template
    //         const clonedBubble = talkBubbleTemplate.cloneNode(true);
    //         clonedBubble.id = `talk-bubble-for-${clickedParagraph.id}`;
    //         clonedBubble.classList.add('talk-bubble-instance'); // Add class to identify cloned bubbles
    //         
    //         // Add placeholder content
    //         const conversationContent = clonedBubble.querySelector('.conversation-content');
    //         if (conversationContent) {
    //             conversationContent.textContent = `Conversation for ${clickedParagraph.id}.`;
    //         }
    //
    //         // Position the bubble
    //         // Position below the paragraph, aligning left edges
    //         // window.scrollY is added to account for page scrolling
    //         clonedBubble.style.position = 'absolute'; // Ensure it's absolute for getBoundingClientRect
    //         clonedBubble.style.top = `${paragraphRect.bottom + window.scrollY + 5}px`; // 5px offset
    //         clonedBubble.style.left = `${paragraphRect.left + window.scrollX}px`;
    //         
    //         // Make it visible
    //         clonedBubble.style.display = 'block';
    //
    //         // Append to the body or a specific container
    //         document.body.appendChild(clonedBubble);
    //
    //         // Get references to elements within the cloned bubble
    //         const closeButton = clonedBubble.querySelector('.close-bubble');
    //         const userInput = clonedBubble.querySelector('.user-input');
    //         const sendButton = clonedBubble.querySelector('.send-button');
    //         // const conversationContent = clonedBubble.querySelector('.conversation-content'); // Already declared above for placeholder
    //
    //         // Ensure the input field is initially empty for the new bubble
    //         if (userInput) {
    //             userInput.value = '';
    //         }
    //
    //         // Add event listener to its close button
    //         if (closeButton) {
    //             closeButton.addEventListener('click', () => {
    //                 clonedBubble.remove();
    //             });
    //         }
    //
    //         // Add event listener to its send button
    //         if (sendButton && userInput && conversationContent) {
    //             sendButton.addEventListener('click', (event) => {
    //                 event.preventDefault(); // Prevent potential default form submission behavior
    //                 const messageText = userInput.value.trim();
    //
    //                 if (messageText !== '') {
    //                     const messageElement = document.createElement('p');
    //                     messageElement.textContent = messageText;
    //                     messageElement.classList.add('user-message'); // For potential styling
    //
    //                     conversationContent.appendChild(messageElement);
    //                     userInput.value = ''; // Clear the input field
    //
    //                     // Scroll to the bottom of the conversation
    //                     conversationContent.scrollTop = conversationContent.scrollHeight;
    //                 }
    //             });
    //         }
    //     });
    // });
});
