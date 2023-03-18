const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (userMessage === '') {
    return;
  }

  const userMessageLi = document.createElement('li');
  userMessageLi.classList.add('user-message');
  const userMessageBubble = document.createElement('div');
  userMessageBubble.classList.add('chat-bubble');
  userMessageBubble.textContent = userMessage;
  userMessageLi.appendChild(userMessageBubble);
  chatLog.appendChild(userMessageLi);
  window.scrollTo(0, document.body.scrollHeight);
  socket.emit('chat message', userMessage);
  input.value = '';
});

// const userMessage = input.value.trim();
socket.on('chat message', function(botMessage) {
  const botMessageLi = document.createElement('li');
  botMessageLi.classList.add('bot-message');
  const botMessageBubble = document.createElement('div');
  botMessageBubble.classList.add('chat-bubble');
  // let response;
  // switch(userMessage) {
  //   case 1:
  //     response = 'Place your order';
  //     break;
  //   case '97':
  //     response = 'Here is your current order';
  //     break;
  //   case '98':
  //     response = 'Here is your order history';
  //     break;
  //   case '99':
  //     response = 'Thank you for shopping with us!';
  //     break;
  //   case '0':
  //     response = 'Your order has been cancelled';
  //     break;
  //   default:
  //     response = 'I did not understand your message. Please try again.';
  //     break;
  // }
  botMessageBubble.textContent = botMessage;
  botMessageLi.appendChild(botMessageBubble);
  chatLog.appendChild(botMessageLi);
  window.scrollTo(0, document.body.scrollHeight);
});
