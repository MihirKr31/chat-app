import dotenv from "dotenv"
dotenv.config();

import { initSocket } from './src/lib/socket.js'
import http from 'http';
import express from 'express'
import authRoutes from './src/routes/authRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import { connectDb } from './src/lib/db.js';
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3000;

connectDb();

app.use(express.json({ limit: '10mb' })); // increase limit as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = ['http://localhost:5173']
app.use(cors({origin:allowedOrigins,credentials :true}))
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);

const io = initSocket(server);

server.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT} `)
});
