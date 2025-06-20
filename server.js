// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 模擬資料庫（記憶體存）
let userSettings = {
  theme: 'light',
  fontSize: 'base',
  mainColor: '#4f46e5', // Indigo-600
  autoEmoji: false,
  enterSend: false,
  enableSound: false,
};

// 取得設定
app.get('/api/settings', (req, res) => {
  res.json(userSettings);
});

// 更新設定
app.post('/api/settings', (req, res) => {
  const newSettings = req.body;
  userSettings = { ...userSettings, ...newSettings };
  res.json({ message: '設定已更新', settings: userSettings });
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
