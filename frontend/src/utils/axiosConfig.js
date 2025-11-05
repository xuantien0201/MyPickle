import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://mypickle-production.up.railway.app',
});

export default instance;
