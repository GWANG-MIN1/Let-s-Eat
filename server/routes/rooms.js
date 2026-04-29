const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_SORT = new Set(['meeting_time', 'people_limit', 'location', 'menu_category', 'created_at']);

// 방 목록 조회
router.get('/', authMiddleware, (req, res) => {
  const { search, sortBy } = req.query;
  const sortColumn = ALLOWED_SORT.has(sortBy) ? sortBy : 'created_at';

  const params = [];
  let whereClause = '';
  if (search) {
    whereClause = 'WHERE r.name LIKE ?';
    params.push(`%${search}%`);
  }

  const rooms = db.prepare(`
    SELECT r.*,
           u.nickname AS host_nickname,
           (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) AS participant_count
    FROM rooms r
    JOIN users u ON r.host_id = u.id
    ${whereClause}
    ORDER BY r.${sortColumn} DESC
  `).all(...params);

  res.json(rooms);
});

// 방 만들기
router.post('/', authMiddleware, (req, res) => {
  const { name, peopleLimit, location, menuCategory, specificMenu, meetingTime } = req.body;

  if (!name || !location || !meetingTime) {
    return res.status(400).json({ error: '방 제목, 장소, 약속 시간은 필수입니다.' });
  }

  const limit = Number(peopleLimit);
  if (!Number.isInteger(limit) || limit < 2 || limit > 10) {
    return res.status(400).json({ error: '인원 수는 2~10명이어야 합니다.' });
  }

  const result = db
    .prepare('INSERT INTO rooms (name, host_id, people_limit, location, menu_category, specific_menu, meeting_time) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, req.user.id, limit, location, menuCategory || null, specificMenu || null, meetingTime);

  db.prepare('INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)').run(result.lastInsertRowid, req.user.id);

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(room);
});

// 방 상세 조회
router.get('/:id', authMiddleware, (req, res) => {
  const room = db.prepare(`
    SELECT r.*, u.nickname AS host_nickname
    FROM rooms r
    JOIN users u ON r.host_id = u.id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });

  const participants = db.prepare(`
    SELECT u.id, u.nickname, u.manner_score
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ?
  `).all(req.params.id);

  res.json({ ...room, participants });
});

// 방 참여
router.post('/:id/join', authMiddleware, (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });

  const count = db.prepare('SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ?').get(req.params.id).c;
  if (count >= room.people_limit) {
    return res.status(400).json({ error: '방이 가득 찼습니다.' });
  }

  const already = db.prepare('SELECT 1 FROM room_participants WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (already) return res.status(409).json({ error: '이미 참여 중입니다.' });

  db.prepare('INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)').run(req.params.id, req.user.id);
  res.json({ message: '참여 완료' });
});

// 방 나가기
router.post('/:id/leave', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: '방을 나갔습니다.' });
});

// 방 삭제 (방장만)
router.delete('/:id', authMiddleware, (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
  if (room.host_id !== req.user.id) return res.status(403).json({ error: '방장만 삭제할 수 있습니다.' });

  db.prepare('DELETE FROM room_participants WHERE room_id = ?').run(req.params.id);
  db.prepare('DELETE FROM messages WHERE room_id = ?').run(req.params.id);
  db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
  res.json({ message: '방이 삭제되었습니다.' });
});

// 채팅 기록 조회
router.get('/:id/messages', authMiddleware, (req, res) => {
  const messages = db.prepare(`
    SELECT m.id, m.text, m.created_at, u.id AS user_id, u.nickname
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.created_at ASC
  `).all(req.params.id);

  res.json(messages);
});

module.exports = router;
