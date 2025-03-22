import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    song: {
        type: Schema.Types.ObjectId,
        ref: "Song",
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
});