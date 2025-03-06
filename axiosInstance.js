import axios from 'axios';

// Create an axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: 'https://welfare-api-kappa.vercel.app/api',  // Base URL for all API requests
  timeout: 10000,  // Optional: Set a timeout for requests (in milliseconds)
});

// Set default headers here (optional)
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

export default axiosInstance;
