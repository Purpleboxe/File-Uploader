const express = require("express");
const path = require("path");
const router = express.Router();

const fileController = require("../controllers/fileController");
const { notAuth } = require("../config/auth");

router.post("/:id/upload", notAuth, fileController.upload);

router.get("/download/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", fileName);
  res.download(filePath);
});

module.exports = router;
