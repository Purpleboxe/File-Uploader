const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

exports.signup_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.signup_post = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage("Username must be at least 3 characters."),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .escape()
    .withMessage("Password must be at least 6 characters."),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    let { username, password } = req.body;

    let ogName = username;
    username = username.toLowerCase();

    if (!errors.isEmpty()) {
      return res.render("signup", {
        title: "Sign Up",
        username: { ogName },
        errors: errors.array(),
      });
    }

    try {
      const userExists = await prisma.user.findUnique({
        where: { username },
      });

      if (userExists) {
        return res.render("signup", {
          title: "Sign Up",
          username: { ogName },
          errors: [{ msg: "Username already exists." }],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          ogName,
        },
      });

      res.redirect("/login");
    } catch (err) {
      console.error("Error during signup:", err);
      return next(err);
    }
  }),
];
