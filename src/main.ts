interface Message {
  type: 'user' | 'system';
  content: string;
  timestamp: number;
  id?: string;
}

class ChatManager {
  private messages: Message[] = [];
  private chatBox!: HTMLElement;
  private inputField!: HTMLInputElement;
  private sendButton!: HTMLElement;
  private readonly storageKey = 'chatMessages';
  private readonly serverUrl = '/message';
  private pollingInterval: number = 3000; // Poll every 3 seconds (adjust as needed)
  private pollingTimer: number | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await customElements.whenDefined('sl-input');
    await customElements.whenDefined('sl-button');
    this.chatBox = document.querySelector('.chat__box')!;
    this.inputField = document.querySelector('sl-input')!.shadowRoot!.querySelector('input')! as HTMLInputElement;
    this.sendButton = document.querySelector('sl-button')!;
    await this.loadMessages();
    this.renderMessages();
    this.setupEventListeners();
    this.startPolling(); // Start polling for new messages
  }

  private async loadMessages(): Promise<void> {
    try {
      const response = await fetch(this.serverUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Message[] = await response.json();
       // check for new messages
       if (data.length > this.messages.length){
        this.messages = data;
       }
      if (this.messages.length === 0) {
        this.addSystemMessage('Hello');
      }
      this.renderMessages();
    } catch (error) {
      console.error('Error loading messages:', error);
      const storedMessages = localStorage.getItem(this.storageKey);
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
      } else {
        this.addSystemMessage(
          'Error connecting to server. Showing old messages or nothing'
        );
      }
      this.renderMessages();
    }
  }

  private saveMessages(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
  }

  private async addMessage(message: Message): Promise<void> {
    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.messages.push(data);
      this.saveMessages();
      this.renderMessages();
    } catch (error) {
      console.error('Error sending messages:', error);
      this.saveMessages();
      this.renderMessages();
    }
  }

  private addSystemMessage(content: string): void {
    const systemMessage: Message = {
      type: 'system',
      content,
      timestamp: Date.now(),
    };
    this.addMessage(systemMessage);
  }

  private addUserMessage(content: string): void {
    const userMessage: Message = {
      type: 'user',
      content,
      timestamp: Date.now(),
    };
    this.addMessage(userMessage);
  }

  private renderMessages(): void {
    this.chatBox.innerHTML = '';

    this.messages.forEach((message) => {
      const messageElement = document.createElement('span');
      messageElement.classList.add('message', `${message.type}-message`);
      messageElement.textContent = `(${new Date(
        message.timestamp
      ).toLocaleTimeString()}): ${message.content}`;

      this.chatBox.appendChild(messageElement);
    });
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  private setupEventListeners(): void {
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    this.inputField.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  private sendMessage(): void {
    const messageContent = this.inputField.value.trim();
    if (messageContent) {
      this.addUserMessage(messageContent);
      this.inputField.value = '';
    }
  }

  private startPolling(): void {
    this.pollingTimer = window.setInterval(() => {
      this.loadMessages();
    }, this.pollingInterval);
  }

  private stopPolling(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}

window.addEventListener('load', () => {
  new ChatManager();
});
