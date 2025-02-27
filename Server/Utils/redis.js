import {Redis} from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisClint = () => {
    if (process.env.REDIS){
        return new Redis(process.env.REDIS);

    }
}
export default redisClint;