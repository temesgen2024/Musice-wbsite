import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './Utils/errorHandler.js';
import UserRouter from './Route/user.route.js';

const app = express();

app.use(express.json());
app.use (express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.options('*', cors());
app.use(errorHandler)

// routes
app.use('/api/users', UserRouter);


export {app}
