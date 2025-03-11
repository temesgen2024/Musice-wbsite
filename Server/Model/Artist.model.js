import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;

const artistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bio:{
        type: String,
        required: true,
        trim: true
    },
    genres:[String],
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        

    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    albums: [{
        type: Schema.Types.ObjectId,
        ref: "Album"
    }],
    singleSongs: [{
        type: Schema.Types.ObjectId,
        ref: "Song"
    }],
    isApproved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model("Artist", artistSchema);
