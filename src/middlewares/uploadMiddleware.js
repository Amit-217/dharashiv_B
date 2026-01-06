import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Unsupported file type"
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // max 5 files per complaint (IMPORTANT)
  },
  fileFilter,
});

export default upload;
