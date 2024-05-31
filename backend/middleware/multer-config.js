const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const widthInPixels = Math.round(12.87 * 16);
const heightInPixels = Math.round(16.27 * 16);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const upload = multer({ storage }).single("image");

const deleteImage = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete image at ${filePath}:`, err.message);
    }
  });
};

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join("images", req.file.filename);
    const outputFilePath = path.join("images", "resized-" + req.file.filename);

    sharp(filePath)
      .resize(widthInPixels, heightInPixels)
      .toFormat(req.file.mimetype.split('/')[1], {
        quality: 90,
        progressive: true,
        compressionLevel: 9,
      })
      .toFile(outputFilePath, (err, info) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Delete the original file after the resized file is created
        setTimeout(() => deleteImage(filePath), 1000);

        // Attach the resized image path to the request object
        req.file.path = outputFilePath;
        req.file.filename = "resized-" + req.file.filename;
        next();
      });
  });
};

module.exports.deleteImage = deleteImage;
