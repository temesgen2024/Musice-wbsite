import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = () => {
    if (!process.env.REDIS) {
        throw new Error("Redis URL is required");
    }
    const redis = new Redis(process.env.REDIS, {
        maxRetriesPerRequest: 100
    });
    redis.on("error", (error) => {
        console.error("Redis error:", error);
    });
    redis.on("connect", () => {
        console.log("Redis connected");
    });
    return redis;
}

export const redis = redisClient();