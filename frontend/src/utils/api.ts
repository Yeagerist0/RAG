import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const chatWithDocument = async (query: string, useCorrectiveRAG: boolean = true) => {
  const response = await apiClient.post('/chat', {
    query,
    useCorrectiveRAG,
  });

  return response.data;
};

export default apiClient;
