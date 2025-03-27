import { uploadsinglesong } from "../Config/cloudnary.config.js";
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import SongModel from "../Model/Song.model.js";
import fs from "fs";
import cloudinary from "cloudinary";
import ArtistModel from "../Model/Artist.model.js";
import AlbumModel from "../Model/Album.model.js"; // Ensure AlbumModel is imported
import { redis } from "../Utils/redis.js";
import userModel from "../Model/User.model.js";

const cleanupFiles = (files) => {
    files.forEach((file) => fs.unlinkSync(file.path));
};

const getArtistWithUser = async (artistId) => {
    const artist = await ArtistModel.findById(artistId);
    if (!artist) return null;

    const user = await userModel.findById(artist.userId);
    return {
        ...artist.toObject(),
        user: user ? {
            _id: user._id,
            name: user.name,
            email: user.email,
        } : null,
    };
};

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

    cleanupFiles([song, coverImg]);

    return res.status(200).json({
        message: "Song uploaded successfully",
        success: true,
        data: newSong,
    });
});

export const uploadAlbum = catchAsyncError(async (req, res) => {
    const artistId = req.params.artistId;
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
            const { title: songTitle, genre: songGenre } = songsData[i];

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

            fs.unlinkSync(songFile.path);
            return newSong;
        })
    );

    newAlbum.songs = uploadedSongs.map((song) => song._id);
    await newAlbum.save();

    artist.albums.push(newAlbum._id);
    await artist.save();

    cleanupFiles([coverImg]);

    return res.status(200).json({
        message: "Album uploaded successfully",
        success: true,
        data: newAlbum,
    });
});

export const getAllSongs = catchAsyncError(async (req, res) => {
    const cachedSongs = await redis.get("allSongs");
    if (cachedSongs) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedSongs),
        });
    }

    const songs = await SongModel.find();
    if (!songs) {
        return res.status(400).json({ message: "No song found" });
    }

    const songDetail = await Promise.all(
        songs.map(async (song) => {
            const artist = await getArtistWithUser(song.artist._id);
            return { ...song.toObject(), artist };
        })
    );

    await redis.set("allSongs", JSON.stringify(songDetail), "EX", 3600);
    return res.status(200).json({
        success: true,
        data: songDetail,
    });
});

export const getAllAlbums = catchAsyncError(async (req, res) => {
    const cachedAlbums = await redis.get("allAlbums");
    if (cachedAlbums) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedAlbums),
        });
    }

    const albums = await AlbumModel.find();
    if (!albums) {
        return res.status(400).json({ message: "No album found" });
    }

    const albumDetail = await Promise.all(
        albums.map(async (album) => {
            const songs = await Promise.all(
                album.songs.map((songId) => SongModel.findById(songId))
            );
            const artist = await getArtistWithUser(album.artist._id);
            return { ...album.toObject(), songs, artist };
        })
    );

    await redis.set("allAlbums", JSON.stringify(albumDetail), "EX", 3600);
    return res.status(200).json({
        success: true,
        data: albumDetail,
    });
});

export const getSongsById = catchAsyncError(async (req, res) => {
    const { id } = req.params;

    const cachedSong = await redis.get(`song:${id}`);
    if (cachedSong) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedSong),
        });
    }

    const song = await SongModel.findById(id);
    if (!song) {
        return res.status(400).json({ message: "No song found" });
    }

    const artist = await getArtistWithUser(song.artist._id);
    const songDetail = { ...song.toObject(), artist };

    await redis.set(`song:${id}`, JSON.stringify(songDetail), "EX", 3600);
    return res.status(200).json({
        success: true,
        data: songDetail,
    });
});

export const getAlbumsById = catchAsyncError(async (req, res) => {
    const { albumId } = req.params;

    const cachedAlbum = await redis.get(`album:${albumId}`);
    if (cachedAlbum) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(cachedAlbum),
        });
    }

    const album = await AlbumModel.findById(albumId);
    if (!album) {
        return res.status(400).json({ message: "No album found" });
    }

    const songs = await Promise.all(
        album.songs.map((songId) => SongModel.findById(songId))
    );
    const artist = await getArtistWithUser(album.artist._id);
    const albumDetail = { ...album.toObject(), songs, artist };

    await redis.set(`album:${albumId}`, JSON.stringify(albumDetail), "EX", 3600);
    return res.status(200).json({
        success: true,
        data: albumDetail,
    });
});


