const express = require("express");
const path = require("path");
const router = express.Router();

const fileController = require("../controllers/fileController");
const { notAuth } = require("../config/auth");

router.post("/:id/upload", notAuth, fileController.upload);

router.get("/:fileId/download", notAuth, fileController.download);

module.exports = router;
