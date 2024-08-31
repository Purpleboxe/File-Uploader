const express = require("express");
const path = require("path");
const router = express.Router();

const folderController = require("../controllers/folderController");
const { notAuth } = require("../config/auth");

router.get("/create", folderController.create_get);
router.post("/create", folderController.create_post);

module.exports = router;
