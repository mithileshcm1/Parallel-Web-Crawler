import axios from 'axios';

const API_BASE_URL = '/api';

export const startCrawl = async (crawlConfig) => {
  const response = await axios.post(`${API_BASE_URL}/crawl`, crawlConfig);
  return response.data;
};

export const getProgress = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress`);
  return response.data;
};

export const getResults = async () => {
  const response = await axios.get(`${API_BASE_URL}/results`);
  return response.data;
};

export const getSummary = async () => {
  const response = await axios.get(`${API_BASE_URL}/summary`);
  return response.data;
};

export const downloadFile = (filename) => {
  window.open(`${API_BASE_URL}/download?file=${filename}`, '_blank');
};
