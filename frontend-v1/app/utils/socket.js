// socket.js
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL); // Change this to your backend URL

export default socket;
