import AsyncStorage from '@react-native-async-storage/async-storage';

// Create your axios instance
const API = axios.create({ baseURL: 'http://localhost:5000/api/users' });

// Add an interceptor to include the token for every request
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export your API functions as before
export const getUsers = () => API.get('/');
export const getUserById = (id) => API.get(`/${id}`);
export const createUser = (user) => API.post('/register', user);
export const updateUser = (id, user) => API.put(`/${id}`, user);
export const deleteUser = (id) => API.delete(`/${id}`);
