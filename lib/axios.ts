import axios from 'axios';
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true;

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_API_URL,
    withCredentials: true,
});

axiosInstance.interceptors.request.use(config => {
    const apiToken = Cookies.get('API-TOKEN');

    if (apiToken) {
        config.headers.Authorization = `Bearer ${apiToken}`;
    }
    return config;
});

export default axiosInstance;
