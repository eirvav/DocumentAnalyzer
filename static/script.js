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
    const triggerWidth = window.innerWidth * 0.1; // 10% of window width

    document.addEventListener('mousemove', function(e) {
        if (e.clientX <= triggerWidth) {
            sideMenu.style.left = '0';
        } else if (e.clientX > 250) { // Width of the menu
            sideMenu.style.left = '-250px';
        }
    });

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

    function sendMessage(e) {
        e.preventDefault();
        var formData = new FormData();
        
        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
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
            }
            // Clear the input field and file preview after sending
            if (userInput) {
                userInput.value = '';
            }
            clearFilePreview();
            toggleWelcomeScreen();
        })
        .catch(error => {
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.error('Error:', error);
            addMessageToChatLog('assistant', `Error: ${error}`);
            toggleWelcomeScreen();
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
        downloadLink.download = '';
        
        const lastAssistantMessage = chatLog.querySelector('.assistant-message:last-child');
        if (lastAssistantMessage) {
            lastAssistantMessage.appendChild(downloadLink);
        }
    }

    // Display the name of the uploaded file in the input field
    if (fileInput) {
        fileInput.onchange = function() {
            if (this.files.length > 0) {
                var fileName = this.files[0].name;
                updateFilePreview(fileName);
            }
        };
    }

    function updateFilePreview(fileName) {
        filePreview.innerHTML = `
            <div class="file-preview-item">
                <i class="fas fa-file-pdf"></i>
                <span>${fileName}</span>
                <button class="remove-file">&times;</button>
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