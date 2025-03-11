import express from 'express';
import { registerUser,activaUserAccount, loginUser, updateProfile } from '../Controller/User.Controller.js';
import { isAuthinticated } from '../Middleware/auth.middleware.js';

// create an express router
const UserRouter = express.Router();

// user registration route
UserRouter.post('/register', registerUser);

// user account activation route
UserRouter.post('/activate', activaUserAccount);

// user login route
UserRouter.post('/login', loginUser);

UserRouter.put('/update', isAuthinticated, updateProfile);


export default UserRouter;

