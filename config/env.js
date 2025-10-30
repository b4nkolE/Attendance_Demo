import dotenv from "dotenv";
const {config} = dotenv;


config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});


export const {
    PORT,
    MONGODB_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN
} = process.env