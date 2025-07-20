class TemplateFinder {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.initializeEventListeners();
        this.scrollToBottom();
    }

    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        
        // Auto-resize input and prevent empty messages
        this.messageInput.addEventListener('input', () => {
            this.sendButton.style.opacity = this.messageInput.value.trim() ? '1' : '0.5';
        });
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addUserMessage(message);
        
        // Clear input
        this.messageInput.value = '';
        this.sendButton.style.opacity = '0.5';

        // Determine if this is a search query or conversational message
        if (this.isSearchQuery(message)) {
            await this.handleTemplateSearch(message);
        } else {
            await this.handleConversationalMessage(message);
        }
    }

    isSearchQuery(message) {
        // Convert to lowercase for case-insensitive matching
        const lowerMessage = message.toLowerCase();
        
        // Keywords that indicate a search intent
        const searchKeywords = [
            'find', 'search', 'look for', 'get', 'show me', 'need', 'want',
            'automation', 'template', 'workflow', 'integration', 'connector',
            'help me with', 'how to', 'can you find', 'looking for',
            'email', 'slack', 'discord', 'notion', 'airtable', 'google',
            'microsoft', 'salesforce', 'hubspot', 'zapier', 'n8n'
        ];
        
        // Conversational phrases that should NOT trigger search
        const conversationalPhrases = [
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
            'how are you', 'what\'s up', 'thanks', 'thank you', 'bye', 'goodbye',
            'ok', 'okay', 'yes', 'no', 'cool', 'awesome', 'great', 'nice'
        ];
        
        // Check if it's purely conversational
        if (conversationalPhrases.some(phrase => lowerMessage === phrase || lowerMessage.startsWith(phrase + ' ') || lowerMessage.endsWith(' ' + phrase))) {
            return false;
        }
        
        // Check if it contains search keywords
        return searchKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    async handleTemplateSearch(query) {
        this.showTypingIndicator();
        
        try {
            // Extract the actual search query from the message
            const searchQuery = this.extractSearchQuery(query);
            
            // Determine which endpoint to use based on environment
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isReplit = window.location.hostname.includes('replit.dev') || window.location.hostname.includes('replit.app');
            
            let response;
            
            if (isLocalhost || isReplit) {
                // Use proxy endpoint for localhost and Replit
                response = await fetch('/api/search-templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: searchQuery })
                });
            } else {
                // Direct call for GitHub Pages and other static hosts
                response = await fetch('https://cs100.app.n8n.cloud/webhook/template-search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: searchQuery }),
                    mode: 'cors'
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let templates = await response.json();
            
            // Handle both single object and array responses
            if (!Array.isArray(templates)) {
                templates = [templates];
            }
            
            // Add bot response with template results
            this.addBotMessageWithTemplates(templates, searchQuery);
            
        } catch (error) {
            console.error('Error searching templates:', error);
            let errorMessage = "I'm sorry, I encountered an error while searching for templates. ";
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += "This might be due to browser security restrictions. The search works best when hosted on a server with backend support.";
            } else if (error.message.includes('404')) {
                errorMessage += "The search service is temporarily unavailable. Please try again later.";
            } else if (error.message.includes('cors')) {
                errorMessage += "There's a browser security restriction preventing the search. This works best on supported hosting platforms.";
            } else {
                errorMessage += "Please try again in a moment.";
            }
            
            this.addBotMessage(errorMessage);
        }
        
        this.hideTypingIndicator();
    }

    extractSearchQuery(message) {
        // Remove common conversational prefixes to extract the core query
        const prefixesToRemove = [
            'can you find', 'find me', 'find', 'search for', 'look for',
            'show me', 'get me', 'i need', 'i want', 'help me find',
            'help me with', 'looking for'
        ];
        
        let query = message.toLowerCase();
        
        for (const prefix of prefixesToRemove) {
            if (query.startsWith(prefix)) {
                query = query.substring(prefix.length).trim();
                break;
            }
        }
        
        return query || message;
    }

    async handleConversationalMessage(message) {
        this.showTypingIndicator();
        
        // Add a slight delay to make the response feel more natural
        await this.delay(800);
        
        const lowerMessage = message.toLowerCase();
        let response;
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello! I'm here to help you find automation templates. Just ask me to find templates for any task you need to automate!";
        } else if (lowerMessage.includes('how are you')) {
            response = "I'm doing great, thank you! I'm ready to help you discover some amazing automation templates. What kind of automation are you looking for?";
        } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            response = "You're welcome! Feel free to ask me to find more templates whenever you need them.";
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            response = "Goodbye! Come back anytime you need help finding automation templates. Have a great day!";
        } else if (lowerMessage.includes('help')) {
            response = "I can help you find automation templates! Just ask me something like 'Find email automation templates' or 'Show me Slack integrations' and I'll search our database for you.";
        } else {
            response = "I understand you're chatting with me! To search for automation templates, try asking something like 'Find templates for email automation' or 'Show me workflow templates for [your specific task]'.";
        }
        
        this.addBotMessage(response);
        this.hideTypingIndicator();
    }

    addUserMessage(text) {
        const messageElement = this.createMessageElement('user', text);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(text) {
        const messageElement = this.createMessageElement('bot', text);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessageWithTemplates(templates, query) {
        if (!templates || templates.length === 0) {
            this.addBotMessage(`I couldn't find any templates matching "${query}". Try using different keywords or asking for a broader category like "email automation" or "Slack workflows".`);
            return;
        }

        // Create response message
        const responseText = `I found ${templates.length} template${templates.length > 1 ? 's' : ''} for "${query}". Here are the best matches:`;
        
        const messageElement = this.createMessageElement('bot', responseText);
        
        // Add template results
        const templateResults = document.createElement('div');
        templateResults.className = 'template-results';
        
        templates.slice(0, 5).forEach(template => {
            const templateCard = this.createTemplateCard(template);
            templateResults.appendChild(templateCard);
        });
        
        messageElement.querySelector('.message-bubble').appendChild(templateResults);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        
        // Format date if available
        const formattedDate = template.date ? new Date(template.date).toLocaleDateString() : '';
        
        card.innerHTML = `
            <div class="template-title">${this.escapeHtml(template.title || 'Untitled Template')}</div>
            <div class="template-description">${this.escapeHtml(template.description || 'No description available')}</div>
            <div class="template-meta">
                ${template.creator ? `<span><i class="fas fa-user"></i> ${this.escapeHtml(template.creator)}</span>` : ''}
                ${formattedDate ? `<span><i class="fas fa-calendar"></i> ${formattedDate}</span>` : ''}
                ${template.score ? `<span><i class="fas fa-star"></i> Score: ${Math.round(template.score * 100)}%</span>` : ''}
            </div>
            <div class="template-links">
                ${template.youtubeUrl || template.url ? `<a href="${this.escapeHtml(template.youtubeUrl || template.url)}" target="_blank" rel="noopener noreferrer" class="template-link">
                    <i class="fas fa-play"></i> Watch Video
                </a>` : ''}
                ${template.jsonUrl || template.json_url ? `<a href="${this.escapeHtml(template.jsonUrl || template.json_url)}" target="_blank" rel="noopener noreferrer" class="template-link">
                    <i class="fas fa-code"></i> View Template
                </a>` : ''}
            </div>
        `;
        
        return card;
    }

    createMessageElement(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = text;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getCurrentTime();
        
        contentDiv.appendChild(bubbleDiv);
        contentDiv.appendChild(timeDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TemplateFinder();
});
