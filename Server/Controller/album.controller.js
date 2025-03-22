import { uploadsinglesong } from "../Config/cloudnary.config.js";
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import SongModel from "../Model/Song.model.js";
import fs from "fs";
import cloudinary from "cloudinary";
import ArtistModel from "../Model/Artist.model.js"; // Ensure this is imported

export const uploadSingleSong = catchAsyncError(async (req, res) => {
    const artistId = req.params.artistId;
    const { title, genre } = req.body;
    const { song, coverImg } = req.files;

    if (!title || !genre || !coverImg || !song) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const artist = await ArtistModel.findById(artistId);
    if (!artist) {
        return res.status(400).json({ message: "Artist not found" });
    }

    const songUpload = await uploadsinglesong(song.path);
    const myCloud = await cloudinary.v2.uploader.upload(coverImg.path, {
        folder: "coverimg",
        width: 150,
        crop: "scale",
        resource_type: "image",
    });

    const newSong = await SongModel.create({
        title,
        genre,
        artistId,
        song: {
            public_id: songUpload.public_id,
            url: songUpload.secure_url,
        },
        coverImg: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    if (!newSong) {
        return res.status(400).json({ message: "Song not uploaded" });
    }

    artist.singleSongs.push(newSong._id);
    await artist.save();

    fs.unlinkSync(song.path); // Cleanup uploaded file
    fs.unlinkSync(coverImg.path); // Cleanup uploaded file

    return res.status(200).json({
        message: "Song uploaded successfully",
        success: true,
        data: newSong,
    });
});

export const uploadAlbum = catchAsyncError(async (req, res) => {
    const artistId = req.params.artistId; // Fixed destructuring issue
    const { title, genre, songsDetail } = req.body;
    const { coverImg, songs } = req.files;

    if (!title || !genre || !coverImg || !songsDetail) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const artist = await ArtistModel.findById(artistId);
    if (!artist) {
        return res.status(400).json({ message: "Artist not found" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(coverImg.path, {
        folder: "coverimg",
        width: 150,
        crop: "scale",
        resource_type: "image",
    });

    let songsData;
    try {
        songsData = JSON.parse(songsDetail);
        if (!Array.isArray(songsData) || songsData.length === 0) {
            return res.status(400).json({ message: "Invalid song details" });
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid song details" });
    }

    const newAlbum = await AlbumModel.create({
        title,
        genre,
        artist: artistId,
        coverImage: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    if (!newAlbum) {
        return res.status(400).json({ message: "Album not uploaded" });
    }

    const uploadedSongs = await Promise.all(
        songs.map(async (songFile, i) => {
            const songData = songsData[i];
            const { title: songTitle, genre: songGenre } = songData;

            if (!songTitle || !songGenre) {
                throw new Error("Invalid song details");
            }

            const songUpload = await uploadsinglesong(songFile.path);
            const newSong = await SongModel.create({
                title: songTitle,
                genre: songGenre,
                artistId,
                song: {
                    public_id: songUpload.public_id,
                    url: songUpload.secure_url,
                },
                coverImg: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
            });

            fs.unlinkSync(songFile.path); // Cleanup uploaded file
            return newSong;
        })
    );

    newAlbum.songs = uploadedSongs.map((song) => song._id);
    await newAlbum.save();

    artist.albums.push(newAlbum._id);
    await artist.save();

    fs.unlinkSync(coverImg.path); // Cleanup uploaded file

    return res.status(200).json({
        message: "Album uploaded successfully",
        success: true,
        data: newAlbum,
    });
});
