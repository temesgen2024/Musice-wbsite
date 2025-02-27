import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;


const userSchema = new Schema({
    name: {
        type : String,
        required: true,
        trim : true,
        unique :true,

    },
    email: {
        type : String,
        required: true,
        trim : true,
        unique :true,
    },
    password: {
        type : String,
        required: true,
        trim : true,
    },
    avatar:{
        public_id:{
            type :String,
            default : "avatar"
        },
        url:{
            type :String,
            default : "https://res.cloudinary.com/dwzmsns1b/image/upload/v1630685541/avatar/avatar_1_ksjz6b.png"
        }
    },
    role :{
        type : String,
        enmu : ["user", "admin", "artist"],
        default : "user"
    },
    isPremium :{
        type : Boolean,
        default : false
    },
    createdAt :{
        type : Date,
        default : Date.now
    }
});

// Encrypting password before saving user
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.SignAccessToken = function(){
    const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || "5", 10);
    return jwt.sign({id : this._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : accessTokenExpires});
}
const userModel = mongoose.model("User", userSchema) || mongoose.model.User
export default userModel;
