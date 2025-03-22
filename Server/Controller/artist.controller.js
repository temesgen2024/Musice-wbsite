import ArtistModel from "../Model/Artist.model";
import { redis } from "../Utils/redis.js";
import cloudinary from "cloudinary";
import userModel from "../Model/User.model.js";
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import { createArtistProfile } from "../Service/artist.service.js";


export const createArtistProfileController = catchAsyncError(async (req, res) => {
    const userId = req.user.id;
    const {  bio, genre, socialLinks } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "User not found" });
    }
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(400).json({ message: "User not found" });
        
    }
    const currentUser = await userModel.findById(userId);
    if (currentUser.avatar?.public_id){
        await cloudinary.v2.uploader.destroy(currentUser.avatar.public_id);
        
    }
    if (req.file){
        const myCloud = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "avatar",
            width: 150,
            crop: "scale"
        });
        currentUser.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }
    await currentUser.save();
    const artistProfile = await createArtistProfile(userId, bio, genre, socialLinks);
    res.status(200).json({
        success: true,
        message: "Artist profile created successfully",
        artist: artistProfile,
    }); 

});

