import axios from 'axios';
import Cookies from 'js-cookie';

axios.defaults.withCredentials = true;

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_API_URL, // Adjust the base URL according to your Laravel setup
    withCredentials: true, // This is important for Sanctum
});

// Adding CSRF token to the headers
axiosInstance.interceptors.request.use(config => {
    const token = Cookies.get('XSRF-TOKEN');
    console.log("token", token);
    if (token) {
        config.headers['X-XSRF-TOKEN'] = token;
    }
    return config;
});

export default axiosInstance;
