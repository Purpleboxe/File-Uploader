const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");

router.get("/", (req, res, next) => {
  res.render("index", {
    title: "File Uploader",
  });
});

router.get("/signup", indexController.signup_get);
router.post("/signup", indexController.signup_post);

module.exports = router;
