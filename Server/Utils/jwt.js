import dotenv from 'dotenv';
import {redisClint} from './redis.js';
dotenv.config();


const accessTokenOptions = {
    maxAge : 2*24*60*60*1000,
    httpOnly : true,
    secure : process.env.NODE_ENV === "production",
    sameSite : "lax"
}
const refreshTokenOptions = {
    maxAge : 7*24*60*60*1000,
    httpOnly : true,
    secure : process.env.NODE_ENV === "production",
    sameSite : "lax"
}
const sendTokens = (user,statusCode,res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    const userSession ={
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avator: user.avatar,
        name: user.name,
        playList: user.playList,
        __v: user.__v,

    }

    redisClint.set(user._id.toString(),JSON.stringify(userSession), (error)=>{
        if (error){
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
        res.cookie("accessToken", accessToken, accessTokenOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenOptions);

        res.status(statusCode).json({
            success: true,
            userSession
        })
    } )
}
export {sendTokens}