const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");

router.get("/", (req, res, next) => {
  res.render("index", {
    title: "File Uploader",
  });
});

// All signup and login routes
router.get("/signup", indexController.signup_get);
router.post("/signup", indexController.signup_post);

router.get("/login", indexController.login_get);
router.post("/login", indexController.login_post);

router.get("/logout", indexController.logout_get);
router.post("/logout", indexController.logout_post);

module.exports = router;
