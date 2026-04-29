require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/users');
const ratingRoutes = require('./routes/ratings');
const { JWT_SECRET } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// 로그인/회원가입 브루트포스 방어
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: '요청이 너무 많습니다. 15분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/', (_req, res) => res.json({
  name: "Let's Eat API",
  endpoints: [
    'POST /api/auth/signup',
    'POST /api/auth/login',
    'GET  /api/rooms',
    'POST /api/rooms',
    'GET  /api/rooms/:id',
    'POST /api/rooms/:id/join',
    'POST /api/rooms/:id/leave',
    'DELETE /api/rooms/:id',
    'GET  /api/rooms/:id/messages',
    'GET  /api/users/:id',
    'PUT  /api/users/:id',
    'POST /api/ratings',
    'GET  /api/ratings/tags',
  ],
}));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// roomId -> Set<WebSocket>
const roomClients = new Map();

wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.replace(/^\/?\?/, ''));
  const token = params.get('token');
  const roomId = params.get('roomId');

  if (!token || !roomId) {
    ws.close(4001, '토큰과 roomId가 필요합니다.');
    return;
  }

  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch {
    ws.close(4002, '유효하지 않은 토큰입니다.');
    return;
  }

  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(roomId);
  if (!room) {
    ws.close(4003, '방을 찾을 수 없습니다.');
    return;
  }

  if (!roomClients.has(roomId)) roomClients.set(roomId, new Set());
  roomClients.get(roomId).add(ws);

  ws.userId = user.id;
  ws.roomId = roomId;
  ws.nickname = user.nickname;

  ws.on('message', (data) => {
    let parsed;
    try { parsed = JSON.parse(data); } catch { return; }

    const text = (parsed.text || '').trim().slice(0, 1000);
    if (!text) return;

    const result = db
      .prepare('INSERT INTO messages (room_id, user_id, text) VALUES (?, ?, ?)')
      .run(roomId, user.id, text);

    const outgoing = JSON.stringify({
      id: result.lastInsertRowid,
      text,
      sender: user.nickname,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    roomClients.get(roomId)?.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(outgoing);
    });
  });

  ws.on('close', () => {
    const clients = roomClients.get(roomId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) roomClients.delete(roomId);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
