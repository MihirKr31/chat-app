import dotenv from "dotenv"
dotenv.config();
import express from 'express'
import authRoutes from './src/routes/authRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import { connectDb } from './src/lib/db.js';
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3000;

connectDb();
const allowedOrigins = ['http://localhost:5173/']
app.use(express.json());
app.use(cors({origin:allowedOrigins,credentials :true}))
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT} `)
});
