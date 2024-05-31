const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const TARGET_WIDTH = Math.round(12.87675 * 16);
const TARGET_HEIGHT = Math.round(16.27619 * 16);

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

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

const deleteOldImage = (newFileName) => {
  const imagesDir = path.resolve(__dirname, "../images");

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    console.log("Current files in directory:", files);

    const baseName = newFileName
      .split(".")
      .slice(0, -1)
      .join(".")
      .replace(/\d+$/, "");

    files.forEach((file) => {
      const fileBaseName = file
        .split(".")
        .slice(0, -1)
        .join(".")
        .replace(/\d+$/, "");
      const fileExtension = file.split(".").pop();

      if (
        (fileBaseName === baseName || fileBaseName === `resized-${baseName}`) &&
        file !== newFileName
      ) {
        const filePath = path.join(imagesDir, file);
        console.log(`Deleting file: ${file}`);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(
              `Failed to delete image at ${filePath}:`,
              err.message
            );
            return;
          }
          console.log(`Successfully deleted image at ${filePath}`);
        });
      }
    });
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

    const newFileName = req.file.filename;

    deleteOldImage(newFileName);

    const uploadedFilePath = path.join("images", newFileName);
    const outputFilePath = path.join("images", "resized-" + newFileName);


    sharp(uploadedFilePath)
      .resize({
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
      })
      .toFile(outputFilePath, (err, info) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }


        req.file.path = outputFilePath;
        req.file.filename = "resized-" + newFileName;


        next();
      });
  });
};
