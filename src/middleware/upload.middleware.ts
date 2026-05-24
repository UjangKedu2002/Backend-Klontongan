import multer from "multer";

// SIMPAN FILE KE MEMORY (BUKAN KE FOLDER LOCAL)
const storage = multer.memoryStorage();

// VALIDASI FILE GAMBAR
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error("Only JPG, JPEG, PNG, and WEBP image formats are allowed")
    );
  }
};

// MAKSIMAL 5 MB
const limits: multer.Options["limits"] = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
