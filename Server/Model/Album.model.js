import mongoose from "mongoose";

const { Schema } = mongoose;

const albumSchema = new Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    artist: {
        type: Schema.Types.ObjectId,
        ref: "Artist",
        required: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },

    coverImage: {
        type: String,
        required: true,
        trim: true
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: "Song"
    }],
    comment : [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    
    createdAt: {
        type: Date,
        default: Date.now
    },



    
});

const Album = mongoose.model("Album", albumSchema);
export default Album;