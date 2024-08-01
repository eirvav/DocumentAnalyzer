document.addEventListener('DOMContentLoaded', function() {
    const previousChats = document.querySelector('.previous-chats');
    const submitBtn = document.getElementById('submit-btn');
    const fileInput = document.getElementById('file-input');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const loader = document.getElementById('loader');
    const filePreview = document.getElementById('file-preview');
    const welcomeScreen = document.getElementById('welcome-screen');
    const sideMenu = document.querySelector('.side-menu');
    const triggerWidth = window.innerWidth * 0.1;
    let isFirstMessage = true;

    document.addEventListener('mousemove', function(e) {
        if (e.clientX <= triggerWidth) {
            sideMenu.style.left = '0';
        } else if (e.clientX > 250) { // Width of the menu
            sideMenu.style.left = '-250px';
        }
    });

    function autoResize() {
        // Store the current scroll position
        const scrollPos = window.pageYOffset;
        
        // Reset height to auto to get the correct scrollHeight
        this.style.height = 'auto';
        
        // Calculate the new height
        const newHeight = this.scrollHeight;
        
        // Only resize if content exceeds more than one line
        if (newHeight > this.offsetHeight) {
            this.style.height = newHeight + 'px';
        }
        
        // Restore the scroll position
        window.scrollTo(0, scrollPos);
    }

    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitBtn.click();
        }
    });

    // Update placeholder visibility
    userInput.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            this.setAttribute('data-placeholder', this.placeholder);
            this.placeholder = '';
        }
    });

    userInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.placeholder = this.getAttribute('data-placeholder');
        }
    });

    userInput.addEventListener('input', autoResize);

    sideMenu.addEventListener('mouseleave', function() {
        sideMenu.style.left = '-250px';
    });

    function toggleWelcomeScreen() {
        if (chatLog.children.length === 0) {
            welcomeScreen.style.display = 'flex';
        } else {
            welcomeScreen.style.display = 'none';
        }
    }

    if (previousChats) {
        previousChats.addEventListener('wheel', function(e) {
            e.preventDefault();
            previousChats.scrollTop += e.deltaY;
        });
    }


    // Initial call to set welcome screen visibility
    toggleWelcomeScreen();

    if (submitBtn) {
        submitBtn.onclick = sendMessage;
    }

    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage(e);
            }
        });
    }


    //Sjekke om dette funker
    function sendMessage(e) {
        e.preventDefault();
        var formData = new FormData();
        
        if (isFirstMessage && fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        } else if (isFirstMessage) {
            addMessageToChatLog('assistant', 'Error: Please upload a file for the first message');
            return;
        }
        
        if (userInput && userInput.value.trim() !== '') {
            formData.append('user_input', userInput.value);
            addMessageToChatLog('user', userInput.value);
        } else {
            return; // Don't send empty messages
        }
        
        // Show loader and hide welcome screen
        if (loader) {
            loader.style.display = 'block';
            toggleWelcomeScreen();
        }
        
        sendMessageWithRetry(formData, 3); // Retry up to 3 times
    }

    function sendMessageWithRetry(formData, maxRetries, delay = 1000) {
        fetch('/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            if (data.error) {
                addMessageToChatLog('assistant', `Error: ${data.error}`);
            } else {
                addMessageToChatLog('assistant', data.response);
                if (data.csv_available) {
                    addCsvDownloadLink();
                }
                isFirstMessage = false;
            }
            // Clear the input field and file preview after sending
            if (userInput) {
                userInput.value = '';
            }
            clearFilePreview();
            toggleWelcomeScreen();
        })
        .catch(error => {
            console.error('Error:', error);
            if (maxRetries > 0) {
                setTimeout(() => {
                    sendMessageWithRetry(formData, maxRetries - 1, delay * 2);
                }, delay);
            } else {
                // Hide loader
                if (loader) {
                    loader.style.display = 'none';
                }
                addMessageToChatLog('assistant', `Error: ${error}`);
                toggleWelcomeScreen();
            }
        });
    }

    function addMessageToChatLog(sender, message) {
        if (chatLog) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', `${sender}-message`);
            
            if (sender === 'assistant') {
                const contentElement = document.createElement('div');
                contentElement.classList.add('assistant-content');
    
                const logoElement = document.createElement('img');
                logoElement.src = '/static/assistant-logo.png';
                logoElement.alt = 'Assistant';
                logoElement.classList.add('assistant-logo');
                
                const textElement = document.createElement('div');
                textElement.classList.add('assistant-text');
                textElement.textContent = message;
                
                contentElement.appendChild(logoElement);
                contentElement.appendChild(textElement);
                messageElement.appendChild(contentElement);
            } else {
                messageElement.textContent = message;
            }
            
            chatLog.appendChild(messageElement);
            chatLog.scrollTop = chatLog.scrollHeight;
            toggleWelcomeScreen();
        }
    }
    
    function addCsvDownloadLink() {
        const downloadLink = document.createElement('a');
        downloadLink.href = '/download_csv';
        downloadLink.className = 'download-csv';
        downloadLink.textContent = 'Download CSV';
        downloadLink.addEventListener('click', function(e) {
            e.preventDefault();
            fetch('/download_csv')
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'response.csv';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => console.error('Error downloading CSV:', error));
        });
        
        const lastAssistantMessage = chatLog.querySelector('.assistant-message:last-child');
        if (lastAssistantMessage) {
            lastAssistantMessage.appendChild(downloadLink);
        }
    }

    // Display the name of the uploaded file in the input field
    if (fileInput) {
        fileInput.onchange = function() {
            if (this.files.length > 0 && isFirstMessage) {
                var fileName = this.files[0].name;
                updateFilePreview(fileName);
            } else if (!isFirstMessage) {
                clearFilePreview();
                alert('File upload is only allowed for the first message');
            }
        };
    }

    function updateFilePreview(fileName) {
        filePreview.innerHTML = `
            <div class="file-preview-item">
                <i class="fas fa-file-pdf"></i>
                <span>${fileName}</span>
                <button class="remove-file" style="font-size: 1.3rem;">&times;</button>
            </div>
        `;
        filePreview.style.display = 'block';
        
        // Add event listener to remove button
        const removeButton = filePreview.querySelector('.remove-file');
        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            clearFilePreview();
        });
    }

    function clearFilePreview() {
        fileInput.value = '';
        filePreview.innerHTML = '';
        filePreview.style.display = 'none';
    }
});

