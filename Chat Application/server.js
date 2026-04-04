const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Map();
const sockets = new Map();

function timestamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('joinRoom', (username) => {
    if (!username || typeof username !== 'string') return;
    username = username.trim();
    users.set(socket.id, username);
    sockets.set(username, socket.id);

    socket.broadcast.emit('notification', {
      text: `${username} joined the chat`,
      time: timestamp(),
    });

    io.emit('userList', Array.from(sockets.keys()));
  });

  socket.on('typing', ({ typing, to }) => {
    const username = users.get(socket.id);
    if (!username) return;
    if (to && sockets.has(to)) {
      io.to(sockets.get(to)).emit('typing', { username, typing, private: true });
    } else {
      socket.broadcast.emit('typing', { username, typing, private: false });
    }
  });

  socket.on('sendMessage', ({ text, to }) => {
    const username = users.get(socket.id);
    if (!username || !text || typeof text !== 'string') return;

    const message = {
      username,
      text: text.trim(),
      time: timestamp(),
      private: Boolean(to),
      to: to || null,
    };

    if (to && sockets.has(to) && to !== username) {
      const targetSocketId = sockets.get(to);
      socket.emit('privateMessage', { ...message, to, from: username });
      io.to(targetSocketId).emit('privateMessage', { ...message, to, from: username });
    } else {
      io.emit('message', message);
    }
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (!username) return;

    users.delete(socket.id);
    sockets.delete(username);

    socket.broadcast.emit('notification', {
      text: `${username} left the chat`,
      time: timestamp(),
    });

    io.emit('userList', Array.from(sockets.keys()));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
