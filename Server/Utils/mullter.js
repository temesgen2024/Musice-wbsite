// config/multer.js
import multer from 'multer';

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    }
});

// Initialize Multer with the storage configuration
const uploadSingle = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit per file
}).fields([
    { name: 'song', maxCount: 1 }, // Match 'song' field for single song upload
    { name: 'coverImg', maxCount: 1 } // Match 'coverImg' field for cover image
]);

const uploadMultiple = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit per file
}).fields([
    { name: 'songs', maxCount: 10 }, // Match 'songs' field for multiple song uploads
    { name: 'coverImg', maxCount: 1 } // Match 'coverImg' field for album cover image
]);

// Middleware to log incoming field names for debugging
const logFieldNames = (req, res, next) => {
    console.log('Incoming fields:', req.body, req.files);
    next();
};

export { uploadSingle, uploadMultiple, logFieldNames };
