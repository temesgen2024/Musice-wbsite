import express from 'express';
import { authorizeRoles, isAuthinticated } from '../Middleware/auth.middleware.js';
import { uploadAlbum, uploadSingleSong } from '../Controller/album.controller.js';
import { uploadMultipleSongs, uploadSingle } from '../Utils/mullter.js';


const artistRouter = express.Router();

artistRouter.post("/uploadSong/:id",isAuthinticated,authorizeRoles("artist"),uploadSingle,uploadSingleSong)
artistRouter.post("/uploadAlbum/:id",isAuthinticated,authorizeRoles("artist"),uploadMultipleSongs,uploadAlbum)
export default artistRouter;

