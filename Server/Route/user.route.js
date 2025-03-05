import express from 'express';
import { registerUser,activaUserAccount, loginUser } from '../Controller/User.Controller.js';

// create an express router
const UserRouter = express.Router();

// user registration route
UserRouter.post('/register', registerUser);

// user account activation route
UserRouter.post('/activate', activaUserAccount);

// user login route
UserRouter.post('/login', loginUser);


export default UserRouter;

