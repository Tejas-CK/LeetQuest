import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export async function fetchProblems(filters = {}) {
  const params = new URLSearchParams();
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.solved !== undefined && filters.solved !== null) {
    params.append('solved', filters.solved);
  }
  if (filters.search) params.append('search', filters.search);
  params.append('limit', filters.limit || 100);
  const res = await axios.get(`${API_BASE}/problems?${params.toString()}`);
  return res.data;
}

export async function toggleSolved(id, solved) {
  const res = await axios.patch(`${API_BASE}/problems/${id}`, { solved });
  return res.data;
}

export async function fetchStats() {
  const res = await axios.get(`${API_BASE}/problems/stats/summary`);
  return res.data;
}

export async function fetchUserStats() {
  const res = await axios.get(`${API_BASE}/user/stats`);
  return res.data;
}

export async function fetchHeatmap() {
  const res = await axios.get(`${API_BASE}/problems/stats/heatmap`);
  return res.data;
}

export async function resetUser({ resetXp = false, resetStreak = false }) {
  const res = await axios.post(`${API_BASE}/user/reset`, { resetXp, resetStreak });
  return res.data;
}

export async function fetchTodaysQuest() {
  const res = await axios.get(`${API_BASE}/quest/today`);
  return res.data;
}

export async function submitReview(problemId, intervalDay) {
  const res = await axios.post(`${API_BASE}/quest/review/${problemId}`, {
    interval_day: intervalDay,
  });
  return res.data;
}

export async function fetchQuestStats() {
  const res = await axios.get(`${API_BASE}/quest/stats`);
  return res.data;
}