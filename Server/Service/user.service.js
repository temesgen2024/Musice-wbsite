import userModel from "../Model/User.model.js";
import ArtistModel from "../Model/Artist.model.js";
import { redis } from "../Utils/redis.js";

export const getUserProfile = async (userId) => {
    try {
        let catchedUser = await redis.get(userId);
        if (catchedUser) {
            catchedUser = JSON.parse(catchedUser);
            if (catchedUser.role === "artist") {
                const artistData = await ArtistModel.findOne({ userId });

                if (artistData) {
                    Object.assign(catchedUser, {
                        artistId: artistData._id,
                        bio: artistData.bio,
                        genres: artistData.genres,
                        socialLinks: artistData.socialLinks,
                        albums: artistData.albums,
                        singleSongs: artistData.singleSongs,
                        followers: artistData.followers,
                        isApproved: artistData.isApproved,
                    });
                    await redis.set(userId, JSON.stringify(catchedUser), "EX", 3600);
                }
            }
            return catchedUser;
        }
        const user = await userModel.findById(userId).lean();
        if (!user) {
            throw new Error("User not found");
        }
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            name: user.name,
            createdAt: user.createdAt,

        }
        if (user.role === "artist") {
            const artistData = await ArtistModel.findOne({ userId }).lean();
            if (artistData) {
                Object.assign(userData, {
                    artistId: artistData._id,
                    bio: artistData.bio,
                    genres: artistData.genres,
                    socialLinks: artistData.socialLinks,
                    albums: artistData.albums,
                    singleSongs: artistData.singleSongs,
                    followers: artistData.followers,
                    isApproved: artistData.isApproved,
                });
            }
        }

        await redis.set(userId, JSON.stringify(userData), "EX", 3600);
        return userData;
    } catch (error) { 
        throw new Error(error.message);
    }
};

