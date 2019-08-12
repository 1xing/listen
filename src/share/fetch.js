import axios from 'axios';

const fetch = axios.create({
  baseURL: '/api',
  withCredentials: true
});

fetch.interceptors.request.use((request) => request);

fetch.interceptors.response.use((response) => response.data);

export default fetch;
