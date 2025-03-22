import mongoose from "mongoose";

const { Schema } = mongoose;

const generSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true 
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

const Genre = mongoose.model("Genre", generSchema);

export default Genre;
