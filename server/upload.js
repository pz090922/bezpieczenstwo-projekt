const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedMimes = ["image/jpeg", "image/png"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Niedozwolony format pliku. Akceptowane formaty: JPEG i PNG."),
      false
    );
  }
};

const uploadMiddleware = (req, res, next) => {
  try {
    multer({ storage, fileFilter }).single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res
          .status(400)
          .json({ error: "Tylko obrazki JPG/PNG są akceptowalne" });
      }
      next();
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

module.exports = uploadMiddleware;
