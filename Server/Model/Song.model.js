import mongoose from "mongoose";

const { Schema } = mongoose;
const songSchema = new Schema({
    title :{
        type: String,
        required: true,
        trim: true
        
    },

    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist",
        required: true
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: "Album",
    },
    genre: {
        type: String,
        required: true,
        trim: true,

    },

    songUrl: {
        type: String,
        required: true,
        trim: true
    },
    coverImage: {
        type: String,
        required: true,
        trim: true
    },
    
    like : {
        type: Number,
        default: 0
    },
    dislike : {
        type: Number,
        default: 0
    },
    comment : [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }

});

const SongModel =  mongoose.model("Song", songSchema);
export default SongModel;
