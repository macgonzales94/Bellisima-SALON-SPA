// chat.js
class ChatWidget {
    constructor() {
        this.socket = null;
        this.unreadCount = 0;
        this.isOpen = false;
        this.initElements();
        this.initEvents();
        this.initSocket();
    }

    initElements() {
        // Obtener referencias a los elementos del DOM
        this.chatIcon = document.getElementById('chatIcon');
        this.chatWindow = document.getElementById('chatWindow');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessageBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.notificationBadge = document.getElementById('chatNotification');

        // Verificar que todos los elementos existan
        if (!this.chatIcon || !this.chatWindow || !this.closeChatBtn || 
            !this.messageInput || !this.sendMessageBtn || !this.chatMessages) {
            console.error('No se pudieron encontrar todos los elementos del chat');
            return;
        }
    }

    initEvents() {
        // Event listeners para abrir/cerrar el chat
        this.chatIcon.addEventListener('click', () => {
            console.log('Chat icon clicked'); // Debug
            this.toggleChat();
        });
        
        this.closeChatBtn.addEventListener('click', () => {
            console.log('Close button clicked'); // Debug
            this.toggleChat();
        });

        // Event listeners para enviar mensajes
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Event listener para el indicador de escritura
        let typingTimeout;
        this.messageInput.addEventListener('input', () => {
            clearTimeout(typingTimeout);
            this.socket.emit('escribiendo');
            typingTimeout = setTimeout(() => {}, 1000);
        });
    }

    initSocket() {
        // Obtener token si existe
        const token = localStorage.getItem('token');

        // Inicializar Socket.IO con o sin token
        this.socket = io('http://localhost:3000', {
            auth: {
                token: token || null
            }
        });

        // Eventos del socket
        this.socket.on('connect', () => {
            console.log('Conectado al chat');
        });

        this.socket.on('mensaje_sistema', (data) => {
            // Actualizar el título del chat
            const chatHeader = document.querySelector('.chat-header h3');
            if (chatHeader) {
                if (data.isAuthenticated && data.userName) {
                    chatHeader.textContent = `Chat con Bellisima - ${data.userName}`;
                } else {
                    chatHeader.textContent = 'Chat con Bellisima';
                }
            }

            // Agregar el mensaje de bienvenida
            this.addSystemMessage(data.mensaje);
        });

        this.socket.on('nuevoMensaje', (data) => {
            this.addMessage(data.contenido, data.usuario, data.isAuthenticated);
            
            if (!this.isOpen) {
                this.unreadCount++;
                this.updateNotificationBadge();
            }
        });

        this.socket.on('usuario_escribiendo', (data) => {
            this.showTypingIndicator(data.usuario);
        });

        this.socket.on('error', (error) => {
            console.error('Error en el chat:', error);
            this.addSystemMessage('Error de conexión');
        });
    }

    toggleChat() {
        console.log('Toggling chat, current state:', this.isOpen); // Debug
        this.isOpen = !this.isOpen;
        this.chatWindow.classList.toggle('active');
        
        if (this.isOpen) {
            this.messageInput.focus();
            this.unreadCount = 0;
            this.updateNotificationBadge();
        }
    }

    sendMessage() {
        const mensaje = this.messageInput.value.trim();
        if (!mensaje) return;

        this.socket.emit('enviarMensaje', {
            contenido: mensaje
        });

        this.messageInput.value = '';
    }

    addMessage(message, usuario, isAuthenticated) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isAuthenticated ? 'authenticated' : ''}`;
        messageElement.innerHTML = `
            <strong>${usuario}:</strong>
            <span>${message}</span>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addSystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        
        // Asegurarse de que no se muestre 'undefined'
        const cleanMessage = message.replace(' undefined', '');
        messageElement.textContent = cleanMessage;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    showTypingIndicator(usuario) {
        const typingElement = document.getElementById('typingIndicator');
        if (!typingElement) {
            const element = document.createElement('div');
            element.id = 'typingIndicator';
            element.className = 'typing-indicator';
            element.textContent = `${usuario} está escribiendo...`;
            this.chatMessages.appendChild(element);
            this.scrollToBottom();

            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 3000);
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updateNotificationBadge() {
        if (this.unreadCount > 0) {
            this.notificationBadge.textContent = this.unreadCount;
            this.notificationBadge.classList.add('active');
        } else {
            this.notificationBadge.classList.remove('active');
        }
    }
}

// Inicializar el chat cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});