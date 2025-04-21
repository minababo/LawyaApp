import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api/',
  timeout: 5000,
  headers: {
    Accept: 'application/json',
  },
});