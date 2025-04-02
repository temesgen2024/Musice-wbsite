import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './Utils/errorHandler.js';
import UserRouter from './Route/user.route.js';
import AdminRouter from './Route/admin.route.js';
import artistRouter from './Route/artist.router.js';
import bodyParser from 'body-parser';
import multer from 'multer';
const app = express();
const upload = multer({ dest: 'uploads/' }); // Set destination for uploaded files
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit to 10MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // 
// Increase limit to 10MB
app.use(upload.any())
app.use (express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.options('*', cors());
app.use(errorHandler)

// routes
app.use('/api/users', UserRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/artist', artistRouter);

export {app}
