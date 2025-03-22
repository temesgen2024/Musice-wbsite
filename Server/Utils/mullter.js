import mullter from "multer";

const storage = mullter.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const uploadSingle = mullter({
    storage: storage,
    limits: { fileSize: 10*1024*1024 }, // 1 MB limit
}).single("song");

const uploadMultipleSongs = mullter({
    storage: storage,
    limits: { fileSize: 10*1024*1024 }, // 1 MB limit
}).array("songs", 10); // Up to 10 files

export { uploadSingle, uploadMultipleSongs };