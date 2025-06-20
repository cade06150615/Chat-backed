const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

let users = {};         // socket.id -> username
let messages = [];
let inviteCodes = {};   // inviteCode -> inviter username

io.on('connection', (socket) => {
  console.log('🔌 使用者連線：', socket.id);

  socket.on('login', ({ username, inviteCode }) => {
    users[socket.id] = username;

    // 建立邀請碼並回傳
    const userInviteCode = generateInviteCode();
    inviteCodes[userInviteCode] = username;
    socket.emit('invite-code', userInviteCode);

    // 邀請碼系統訊息
    if (inviteCode && inviteCodes[inviteCode]) {
      const inviter = inviteCodes[inviteCode];
      socket.emit('system-message', `你是透過 ${inviter} 的邀請加入的`);
      socket.broadcast.emit('system-message', `${username} 是透過 ${inviter} 的邀請加入聊天室`);
    }

    socket.broadcast.emit('system-message', `歡迎 ${username} 加入聊天室！`);
    socket.emit('chat-history', messages);
  });

  socket.on('chat-message', (msg) => {
    const user = users[socket.id];
    const message = {
      user,
      text: msg,
      time: new Date().toISOString()
    };
    messages.push(message);
    io.emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.emit('system-message', `${user} 離開了聊天室`);
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 伺服器已啟動於 http://localhost:${PORT}`);
});
