import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mypickle-production.up.railway.app' : 'http://localhost:3000'),
});

export default instance;
