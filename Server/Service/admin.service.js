import ArtistModel from "../Model/Artist.model.js";

export const approveArtistService = async (artistId) => {
    const artist = await ArtistModel.findById(artistId);
    if (!artist) {
        return { success: false, message: "Artist not found" };
    }
    artist.isApproved = true;
    await artist.save();
    return artist;
}