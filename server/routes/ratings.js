const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const VALID_TAGS = new Set([
  '식사 매너를 잘 지켜요',
  '약속 시간을 잘 지켜요',
  '친절해요',
  '대화가 즐거워요',
  '다음에도 같이 밥 먹고 싶어요',
]);

// 평가 등록
router.post('/', authMiddleware, (req, res) => {
  const { ratedId, tags } = req.body;

  if (!ratedId || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ error: '평가 대상과 태그를 입력해주세요.' });
  }

  const invalid = tags.filter(t => !VALID_TAGS.has(t));
  if (invalid.length > 0) {
    return res.status(400).json({ error: '유효하지 않은 태그가 포함되어 있습니다.' });
  }

  if (req.user.id === Number(ratedId)) {
    return res.status(400).json({ error: '자기 자신을 평가할 수 없습니다.' });
  }

  const rated = db.prepare('SELECT id FROM users WHERE id = ?').get(ratedId);
  if (!rated) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

  db.prepare('INSERT INTO ratings (rater_id, rated_id, tags) VALUES (?, ?, ?)').run(req.user.id, ratedId, JSON.stringify(tags));

  db.prepare('UPDATE users SET manner_score = manner_score + 0.1 WHERE id = ?').run(ratedId);

  res.status(201).json({ message: '평가가 등록되었습니다.' });
});

// 유효한 태그 목록 조회
router.get('/tags', (req, res) => {
  res.json([...VALID_TAGS]);
});

module.exports = router;
