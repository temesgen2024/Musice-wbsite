import catchAsyncError from "../Middleware/CatchAsyncError.js";
import ArtistModel from "../Model/Artist.model.js";
import userModel from "../Model/User.model.js";
import { approveArtistService } from "../Service/admin.service.js";


export const approveArtist = catchAsyncError(async (req, res) => {
    const {artistId } = req.params;
    const artist = await approveArtistService(artistId);
    res.status(200).json({
        success: true,
        message: "Artist approved successfully",
        artist
    });
});

export const deleteArtitById = catchAsyncError(async (req, res) => {
    const {artistId } = req.params;
    const artist = await ArtistModel.findByIdAndDelete(artistId);
    return res.status(200).json({
        success: true,
        message: "Artist deleted successfully",
        artist
    });
})


export const getAllUsers = catchAsyncError(async (req, res) => {
    const allUsers = await userModel.find({ role: "user" });
    const allArtists = await ArtistModel.find({ isApproved: true }).populate("userId", "username email avatar");
    const allPendingArtists = await ArtistModel.find({ isApproved: false }).populate("userId", "username email avatar");
    return res.status(200).json({
        success: true,
        message: "All users fetched successfully",
        data: {
            allUsers,
            allArtists,
            allPendingArtists
        }
    });
})



export const getById = catchAsyncError(async (req, res) => {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user
    });
})
