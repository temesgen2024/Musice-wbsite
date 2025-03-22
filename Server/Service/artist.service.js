import { redis } from "../Utils/redis";
import ArtistModel from "../Model/Artist.model";


export const createArtistProfile = async (userId, bio, genre, socialLinks) => {
    const existingArtist = await ArtistModel.findOne({ userId });
    if (existingArtist) {
        return { success: false, message: "Artist profile already exists" };
    }
    const artist = await ArtistModel.create({
        userId,
        bio,
        genres: genre,
        socialLinks
    });
    await redis.del(userId);
    return { success: true, artist };
}