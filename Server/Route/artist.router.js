import express from 'express';
import { authorizeRoles, isAuthinticated } from '../Middleware/auth.middleware.js';
import { uploadAlbum, uploadSingleSong } from '../Controller/album.controller.js';
import { createArtistProfileController } from '../Controller/artist.controller.js';
import { uploadSingle } from '../Utils/mullter.js';

const artistRouter = express.Router();
artistRouter.post("/creatProfile", isAuthinticated, createArtistProfileController)
artistRouter.post(
    "/uploadSong/:id",
    isAuthinticated,
    authorizeRoles("artist"),
    uploadSingle,
    uploadSingleSong
);
artistRouter.post(
    "/uploadAlbum/:id",
    isAuthinticated,
    authorizeRoles("artist"),
    uploadAlbum
);
export default artistRouter;

