const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const indexController = require("../controllers/indexController");
const { auth, notAuth } = require("../config/auth");

router.get("/", async (req, res, next) => {
  try {
    res.render("index", {
      title: "File Uploader",
    });
  } catch (err) {
    next(err);
  }
});

// All signup and login routes
router.get("/signup", auth, indexController.signup_get);
router.post("/signup", auth, indexController.signup_post);

router.get("/login", auth, indexController.login_get);
router.post("/login", auth, indexController.login_post);

router.get("/logout", notAuth, indexController.logout_get);
router.post("/logout", notAuth, indexController.logout_post);

module.exports = router;
