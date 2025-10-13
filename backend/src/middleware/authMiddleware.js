import dotenv from "dotenv"
dotenv.config()
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async(req,res,next)=>{

    try {
       const token = req.cookies.jwt;
       
       if(!token)
       {
        return res.status(401).json({ message: 'Not authorized, token missing' });
       }

       const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ message: 'Internal Server error !' });
  }
};