import express from 'express';
import { registerUser,activaUserAccount, loginUser, updateProfile, logoutUser, getUserProfile, followUnfollowArtist, getAllFollowing } from '../Controller/User.Controller.js';
import { isAuthinticated } from '../Middleware/auth.middleware.js';
import { getAllAlbums, getAllSongs, getSongsById } from '../Controller/album.controller.js';

// create an express router
const UserRouter = express.Router();

// user registration route
UserRouter.post('/register', registerUser);

// user account activation route
UserRouter.post('/activate', activaUserAccount);

// user login route
UserRouter.post('/login', loginUser);

// user logout route
UserRouter.post("/logout", isAuthinticated, logoutUser)

UserRouter.get("/me",isAuthinticated,getUserProfile)

// user profile update route
UserRouter.put('/update', isAuthinticated, updateProfile);

UserRouter.post("/followUnfollow",isAuthinticated,followUnfollowArtist)
UserRouter.get("/getAllFollowing",isAuthinticated,getAllFollowing)
UserRouter.get("/getAllSongs",isAuthinticated,getAllSongs)
UserRouter.get("/getAllAlbums",isAuthinticated,getAllAlbums)
UserRouter.get("/getSong/:id",isAuthinticated,getSongsById)
UserRouter.get("/getAlbum/:id",isAuthinticated,getAllAlbums)

export default UserRouter;


