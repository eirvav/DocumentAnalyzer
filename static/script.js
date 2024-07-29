document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const fileInput = document.getElementById('file-input');
    const userInput = document.getElementById('user-input');
    const chatLog = document.getElementById('chat-log');
    const loader = document.getElementById('loader');

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
        
        // Show loader
        if (loader) {
            loader.style.display = 'block';
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
            // Clear the input field after sending
            if (userInput) {
                userInput.value = '';
            }
        })
        .catch(error => {
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.error('Error:', error);
            addMessageToChatLog('assistant', `Error: ${error}`);
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

    // Display the name of the uploaded file
    if (fileInput) {
        fileInput.onchange = function() {
            if (this.files.length > 0) {
                var fileName = this.files[0].name;
                addMessageToChatLog('user', `Uploaded file: ${fileName}`);
            }
        };
    }
});