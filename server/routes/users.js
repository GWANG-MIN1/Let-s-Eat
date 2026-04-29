const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 사용자 프로필 조회
router.get('/:id', authMiddleware, (req, res) => {
  const user = db
    .prepare('SELECT id, username, nickname, email, university, manner_score, created_at FROM users WHERE id = ?')
    .get(req.params.id);

  if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

  const ratingRows = db.prepare('SELECT tags FROM ratings WHERE rated_id = ?').all(req.params.id);
  const tagCounts = {};
  ratingRows.forEach(row => {
    JSON.parse(row.tags).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const participatingRooms = db.prepare(`
    SELECT r.id, r.name, r.meeting_time, r.location
    FROM rooms r
    JOIN room_participants rp ON r.id = rp.room_id
    WHERE rp.user_id = ?
    ORDER BY r.meeting_time DESC
  `).all(req.params.id);

  res.json({ ...user, tagCounts, participatingRooms });
});

// 프로필 수정 (본인만)
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.id !== parseInt(req.params.id, 10)) {
    return res.status(403).json({ error: '본인 프로필만 수정할 수 있습니다.' });
  }

  const { nickname, email } = req.body;
  if (!nickname) return res.status(400).json({ error: '닉네임은 필수입니다.' });

  db.prepare('UPDATE users SET nickname = ?, email = ? WHERE id = ?').run(nickname, email || null, req.params.id);

  const updated = db
    .prepare('SELECT id, username, nickname, email, university, manner_score FROM users WHERE id = ?')
    .get(req.params.id);

  res.json(updated);
});

module.exports = router;
