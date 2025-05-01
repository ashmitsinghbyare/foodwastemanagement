document.addEventListener('DOMContentLoaded', () => {
    // Live Chat Toggle
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');
    const chatBody = document.querySelector('.chat-body');
  
    chatToggle.addEventListener('click', () => {
      if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
        chatToggle.textContent = 'Close Chat';
      } else {
        chatWindow.style.display = 'none';
        chatToggle.textContent = 'Live Chat';
      }
    });
  
    sendChat.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message !== '') {
        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user');
        userMessage.textContent = `You: ${message}`;
        chatBody.appendChild(userMessage);
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
  
        // Simulated bot response
        const botReply = document.createElement('div');
        botReply.classList.add('message', 'support');
        botReply.textContent = "Support: Thank you! We'll get back to you shortly.";
        setTimeout(() => {
          chatBody.appendChild(botReply);
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
      }
    });
  });
  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    hamburger.onclick = function () {
      const navBar = document.querySelector('.nav-bar');
      navBar.classList.toggle('active');
    };
  });
  
  // public/js/scripts.js
const socket = io();  // Connect to the server

// Toggle the live chat window
document.getElementById('chat-toggle').addEventListener('click', () => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = (chatWindow.style.display === 'none') ? 'block' : 'none';
});

// Send a message in the live chat
document.getElementById('send-chat').addEventListener('click', () => {
    const message = document.getElementById('chat-input').value;
    if (message) {
        socket.emit('send-message', message);  // Send the message to the server
        document.getElementById('chat-input').value = '';  // Clear input
    }
});

// Listen for incoming messages from the server
socket.on('receive-message', (message) => {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'user');
    messageContainer.textContent = message;
    document.querySelector('.chat-body').appendChild(messageContainer);
});
  // Auto-hide success or error messages after 4 seconds
  setTimeout(() => {
    const alert = document.querySelector('.alert');
    if (alert) {
      alert.style.display = 'none';
    }
  }, 4000);
  // Auto-hide alert after 4 seconds
  window.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('alert');
    if (alertBox) {
      setTimeout(() => {
        alertBox.style.display = 'none';
      }, 4000);
    }
  });