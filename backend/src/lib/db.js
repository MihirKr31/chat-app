import mongoose from "mongoose";

export const connectDb = async()=>{
    try{
        const con = await mongoose.connect(process.env.MONGODB_URI)
    }
    catch(err)
    {
        console.error(err.message)
        process.exit(1);
    }
};