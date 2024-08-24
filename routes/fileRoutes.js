const express = require("express");
const path = require("path");
const router = express.Router();
const upload = require("../config/multer");

const { notAuth } = require("../config/auth");

router.get("/upload", notAuth, (req, res) => {
  res.render("upload", { title: "Upload File" });
});

router.post("/upload", notAuth, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send(`File uploaded successfully: ${req.file.filename}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred during the upload.");
  }
});

router.get("/download/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", fileName);
  res.download(filePath);
});

module.exports = router;
