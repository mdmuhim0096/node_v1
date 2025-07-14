// middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let directoryName = '';
        if (file.mimetype.startsWith("image/")) {
            directoryName = "postImage"
        } else if (file.mimetype.startsWith("video/")) {
            directoryName = "postVideo"
        }
        cb(null, `./public/${directoryName}`);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

module.exports = upload;