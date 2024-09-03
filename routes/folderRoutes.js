const express = require("express");
const path = require("path");
const router = express.Router();

const folderController = require("../controllers/folderController");
const { notAuth } = require("../config/auth");

router.get("/create", notAuth, folderController.create_get);
router.post("/create", notAuth, folderController.create_post);

router.get("/:id", notAuth, folderController.folder_detail);

module.exports = router;
