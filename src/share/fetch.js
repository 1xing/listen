import axios from 'axios';

const fetch = axios.create({
  baseURL: 'http://94.191.43.76:3000',
  withCredentials: true
});

fetch.interceptors.request.use((request) => request);

fetch.interceptors.response.use((response) => response.data);

export default fetch;
