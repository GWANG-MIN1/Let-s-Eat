import axios from 'axios';

export const BASE_URL = 'http://localhost:3000';
export const WS_URL = 'ws://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

let _token = null;
let _userId = null;
let _nickname = null;

export function setAuth(token, userId, nickname) {
  _token = token;
  _userId = userId;
  _nickname = nickname;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function getAuth() {
  return { token: _token, userId: _userId, nickname: _nickname };
}

export function clearAuth() {
  _token = null;
  _userId = null;
  _nickname = null;
  delete api.defaults.headers.common['Authorization'];
}

// 인증
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password });

export const signup = (data) =>
  api.post('/api/auth/signup', data);

// 방
export const getRooms = (params) =>
  api.get('/api/rooms', { params });

export const createRoom = (data) =>
  api.post('/api/rooms', data);

export const getRoom = (id) =>
  api.get(`/api/rooms/${id}`);

export const joinRoom = (id) =>
  api.post(`/api/rooms/${id}/join`);

export const leaveRoom = (id) =>
  api.post(`/api/rooms/${id}/leave`);

export const deleteRoom = (id) =>
  api.delete(`/api/rooms/${id}`);

export const getRoomMessages = (id) =>
  api.get(`/api/rooms/${id}/messages`);

// 유저
export const getUser = (id) =>
  api.get(`/api/users/${id}`);

export const updateUser = (id, data) =>
  api.put(`/api/users/${id}`, data);

// 평가
export const submitRating = (ratedId, tags) =>
  api.post('/api/ratings', { ratedId, tags });

export const getRatingTags = () =>
  api.get('/api/ratings/tags');
