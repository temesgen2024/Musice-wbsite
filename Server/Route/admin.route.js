import express from 'express';
import { approveArtist, deleteArtitById, getAllUsers, getById } from '../Controller/admin.controller.js';
import { authorizeRoles, isAuthinticated } from '../Middleware/auth.middleware.js';


const AdminRouter = express.Router();

AdminRouter.get ("/allUsers",isAuthinticated,authorizeRoles("admin"),getAllUsers)

AdminRouter.get ("/getById/:userId",isAuthinticated,authorizeRoles("admin"),getById)

AdminRouter.delete ("/deleteById/:userId",isAuthinticated,authorizeRoles("admin"),deleteArtitById)
AdminRouter.put("/approveArtist/:artistId",isAuthinticated,authorizeRoles("admin"),approveArtist)

export default AdminRouter;