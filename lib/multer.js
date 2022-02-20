const multer = require("multer");
const path = require("path");
const avatarsDir = path.join(__dirname, "../tmp");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const newFilename = `${new Date().getTime()}_${file.originalname}`;
    cb(null, newFilename);
  },
});

const acceptedTypes = ["image/png", "image/jpeg"];
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1048576 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (acceptedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Filetype is not supported"));
    }
  },
});
exports.upload = upload;
