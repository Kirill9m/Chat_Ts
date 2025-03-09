"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ChatManager {
    constructor() {
        this.messages = [];
        this.storageKey = 'chatMessages';
        this.serverUrl = 'http://localhost:3000/messages'; // Replace with your server's URL
        this.chatBox = document.querySelector('.chat__box');
        this.inputField = document.querySelector('sl-input').shadowRoot.querySelector('input');
        this.sendButton = document.querySelector('sl-button');
        this.loadMessages(); // Modified this line
        this.renderMessages();
        this.setupEventListeners();
    }
    // Load messages from the server
    loadMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.serverUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = yield response.json();
                this.messages = data;
                if (this.messages.length === 0) {
                    this.addSystemMessage("Hello");
                }
            }
            catch (error) {
                console.error('Error loading messages:', error);
                // Optionally, display an error message to the user
                // Fallback to the local storage
                const storedMessages = localStorage.getItem(this.storageKey);
                if (storedMessages) {
                    this.messages = JSON.parse(storedMessages);
                }
                else {
                    this.addSystemMessage('Error connecting to server. Showing old messages or nothing');
                }
            }
        });
    }
    saveMessages() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    }
    //Send message to the server
    addMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.serverUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = yield response.json();
                this.messages.push(data);
                this.saveMessages();
                this.renderMessages();
            }
            catch (error) {
                console.error('Error sending messages:', error);
                this.saveMessages();
                this.renderMessages();
            }
        });
    }
    addSystemMessage(content) {
        const systemMessage = {
            type: 'system',
            content,
            timestamp: Date.now(),
        };
        this.addMessage(systemMessage);
    }
    addUserMessage(content) {
        const userMessage = {
            type: 'user',
            content,
            timestamp: Date.now(),
        };
        this.addMessage(userMessage);
    }
    renderMessages() {
        this.chatBox.innerHTML = ''; // Clear existing messages
        this.messages.forEach((message) => {
            const messageElement = document.createElement('span');
            messageElement.classList.add('message', `${message.type}-message`);
            messageElement.textContent = `(${new Date(message.timestamp).toLocaleTimeString()}): ${message.content}`;
            this.chatBox.appendChild(messageElement);
        });
        this.chatBox.scrollTop = this.chatBox.scrollHeight; // Scroll to bottom
    }
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        this.inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    sendMessage() {
        const messageContent = this.inputField.value.trim();
        if (messageContent) {
            this.addUserMessage(messageContent);
            this.inputField.value = ''; // Clear the input field
        }
    }
}
// Initialize the chat
window.addEventListener('load', () => {
    new ChatManager();
});
