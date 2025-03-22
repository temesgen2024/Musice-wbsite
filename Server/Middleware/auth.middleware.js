import jwt from 'jsonwebtoken';
import catchAsyncError from './CatchAsyncError.js';
import { redis } from '../Utils/redis.js';
import dotenv from 'dotenv';
dotenv.config();

export const isAuthinticated = catchAsyncError(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
   
    if (!accessToken) {
        return res.status(401).json({ message: "Please login to access this resource" });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
       
        const userSession = await redis.get(decoded.id);
        if (!userSession) {
            return res.status(401).json({ message: "Please login to access this resource  data" });
        }
        req.user = JSON.parse(userSession);
        next();
    } catch (error) {
        return res.status(401).json({ message:error.message });
    }
});


export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user.role}) is not allowed to access this resource` });
        }
        next();
    }
};