const express = require("express");
const router = express.Router();

const fileController = require("../controllers/fileController");
const { notAuth } = require("../config/auth");

router.post("/:id/upload", notAuth, fileController.upload);

router.get("/:fileId/download", notAuth, fileController.download);
router.put("/:fileId/update", notAuth, fileController.update);
router.delete("/:fileId/delete", notAuth, fileController.delete);

module.exports = router;
