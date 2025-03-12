// socket.js
import io from 'socket.io-client';

const socket = io("http://192.168.1.201:5000");

export default socket;
