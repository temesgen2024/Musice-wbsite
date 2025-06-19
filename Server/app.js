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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// CORS configuration
const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative port
    'http://127.0.0.1:5173', // Alternative localhost format
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Handle preflight requests for all routes
app.options('*', cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));
app.use(errorHandler)

// routes
app.use('/api/users', UserRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/artist', artistRouter);

export { app }
