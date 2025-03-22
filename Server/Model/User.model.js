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

    likedSongs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song',
    }],
    dislikedSongs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song',
    }],
    favoriteSongs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song',
    }],
    playlists: [{
        name: {
            type: String,
            required: true,
        },
        songs: [{
            type: Schema.Types.ObjectId,
            ref: 'Song',
        }],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    followingArtists: [{
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        
    }],
    isPremium: {
        type: Boolean,
        default: false,
    },
    subscription: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
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
    const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || "10", 10);
    return jwt.sign({id : this._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn : accessTokenExpires * 60});
}

userSchema.methods.SignRefreshToken = function(){
    const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRES || "7", 10);
    return jwt.sign({id : this._id}, process.env.REFRESH_TOKEN, {expiresIn : refreshTokenExpires});
}

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}


const userModel = mongoose.model("User", userSchema) || mongoose.model.User
export default userModel;
