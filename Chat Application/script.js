const socket = io();
const joinScreen = document.getElementById('joinScreen');
const chatApp = document.getElementById('chatApp');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const statusText = document.getElementById('statusText');
const typingIndicator = document.getElementById('typingIndicator');
const usersList = document.getElementById('usersList');
const onlineCount = document.getElementById('onlineCount');
const recipientBadge = document.getElementById('recipientBadge');
const recipientName = document.getElementById('recipientName');
const clearPrivate = document.getElementById('clearPrivate');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');

let username = '';
let privateRecipient = null;
let typingTimeout = null;
let localTyping = false;

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function addMessage({ username: sender, text, time, private: isPrivate, to, from }, own = false) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message');
  messageEl.classList.add(own ? 'mine' : 'other');
  if (isPrivate) messageEl.classList.add('private');

  const meta = document.createElement('div');
  meta.className = 'meta';
  const identity = document.createElement('span');
  identity.textContent = own ? 'You' : sender;
  const timestamp = document.createElement('span');
  timestamp.textContent = time;
  meta.appendChild(identity);
  meta.appendChild(timestamp);

  const textEl = document.createElement('div');
  textEl.className = 'text';
  if (isPrivate) {
    const privateLabel = document.createElement('strong');
    privateLabel.textContent = from ? `Private from ${from}: ` : 'Private: ';
    textEl.appendChild(privateLabel);
  }
  textEl.appendChild(document.createTextNode(text));

  messageEl.appendChild(meta);
  messageEl.appendChild(textEl);
  messages.appendChild(messageEl);
  scrollToBottom();
}

function addNotification(text) {
  const notice = document.createElement('div');
  notice.className = 'message other';
  notice.style.maxWidth = '100%';
  notice.style.background = 'rgba(59, 130, 246, 0.12)';
  notice.style.textAlign = 'center';
  notice.style.fontStyle = 'italic';
  notice.textContent = text;
  messages.appendChild(notice);
  scrollToBottom();
}

function updateRecipientBadge() {
  if (privateRecipient) {
    recipientName.textContent = privateRecipient;
    recipientBadge.classList.remove('hidden');
    statusText.textContent = `Private chat with ${privateRecipient}`;
  } else {
    recipientBadge.classList.add('hidden');
    statusText.textContent = 'Type a message and press enter';
  }
}

function setTyping(typing) {
  socket.emit('typing', { typing, to: privateRecipient });
}

function handleTypingState(typing, user, isPrivate) {
  if (typing) {
    typingIndicator.textContent = isPrivate
      ? `${user} is typing a private message...`
      : `${user} is typing...`;
  } else {
    typingIndicator.textContent = '';
  }
}

joinBtn.addEventListener('click', () => {
  const value = usernameInput.value.trim();
  if (!value) return;
  username = value;
  joinScreen.classList.add('hidden');
  chatApp.classList.remove('hidden');
  socket.emit('joinRoom', username);
  addNotification(`Welcome, ${username}!`);
});

usernameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') joinBtn.click();
});

messageInput.addEventListener('input', () => {
  if (!username) return;
  if (!localTyping) {
    localTyping = true;
    setTyping(true);
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    localTyping = false;
    setTyping(false);
  }, 800);
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('sendMessage', {
    text,
    to: privateRecipient,
  });
  messageInput.value = '';
  localTyping = false;
  setTyping(false);
});

clearPrivate.addEventListener('click', () => {
  privateRecipient = null;
  updateRecipientBadge();
});

emojiBtn.addEventListener('click', () => {
  emojiPicker.classList.toggle('hidden');
});

emojiPicker.addEventListener('click', (event) => {
  if (event.target.tagName !== 'BUTTON') return;
  messageInput.value += event.target.textContent;
  messageInput.focus();
});

socket.on('message', (message) => {
  const own = message.username === username;
  addMessage(message, own);
});

socket.on('privateMessage', (message) => {
  const own = message.from === username;
  addMessage({ ...message, username: own ? 'You' : message.from, from: message.from }, own);
});

socket.on('notification', ({ text }) => {
  addNotification(text);
});

socket.on('userList', (users) => {
  usersList.innerHTML = '';
  onlineCount.textContent = users.length;
  users
    .filter((user) => user !== username)
    .forEach((user) => {
      const li = document.createElement('li');
      li.textContent = user;
      li.addEventListener('click', () => {
        privateRecipient = user;
        updateRecipientBadge();
      });
      usersList.appendChild(li);
    });
});

socket.on('typing', ({ username: typer, typing, private: isPrivate }) => {
  if (typer === username) return;
  handleTypingState(typing, typer, isPrivate);
});

window.addEventListener('click', (event) => {
  if (!emojiPicker.contains(event.target) && event.target !== emojiBtn) {
    emojiPicker.classList.add('hidden');
  }
});

window.addEventListener('resize', scrollToBottom);
