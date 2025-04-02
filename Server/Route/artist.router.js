import express from 'express';
import multer from 'multer';
import path from 'path';
import { authorizeRoles, isAuthinticated } from '../Middleware/auth.middleware.js';
import { uploadAlbum, uploadSingleSong } from '../Controller/album.controller.js';
import { createArtistProfileController } from '../Controller/artist.controller.js';
import { uploadSingle } from '../Utils/mullter.js';
// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext); // Rename file
    }
});

const upload = multer({ storage: storage });
const artistRouter = express.Router();
artistRouter.post("/creatProfile", isAuthinticated, createArtistProfileController)
artistRouter.post(
    "/uploadSong/:id",
    isAuthinticated,
    authorizeRoles("artist"),
    upload.fields([
        { name: "song", maxCount: 1 },
        { name: "coverImg", maxCount: 1 }
    ]),
    (req, res, next) => {
        if (!req.files || !req.files.song || !req.files.coverImg) {
            return res.status(400).json({ error: "Both song and cover image are required." });
        }
        next();
    },
    uploadSingleSong
);
artistRouter.post(
    "/uploadAlbum/:id",
    isAuthinticated,
    authorizeRoles("artist"),
    uploadAlbum
);

//

export default artistRouter;

