const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', (req, res) => {
  const { username, password, nickname, email, university } = req.body;

  if (!username || !password || !nickname) {
    return res.status(400).json({ error: '아이디, 비밀번호, 닉네임은 필수입니다.' });
  }
  if (username.length < 4 || username.length > 20) {
    return res.status(400).json({ error: '아이디는 4~20자여야 합니다.' });
  }
  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({ error: '비밀번호는 6~100자여야 합니다.' });
  }
  if (nickname.length < 1 || nickname.length > 20) {
    return res.status(400).json({ error: '닉네임은 1~20자여야 합니다.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: '이미 사용 중인 아이디입니다.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (username, password_hash, nickname, email, university) VALUES (?, ?, ?, ?, ?)')
    .run(username, passwordHash, nickname, email || null, university || null);

  const token = jwt.sign(
    { id: result.lastInsertRowid, username, nickname },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, userId: result.lastInsertRowid, nickname });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, userId: user.id, nickname: user.nickname });
});

module.exports = router;
