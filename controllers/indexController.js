const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const passportConfig = require("../config/passport");

exports.signup_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up", errors: [] });
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

exports.login_get = (req, res, next) => {
  res.render("login", { title: "Log In", errors: [] });
};

exports.login_post = (req, res, next) => {
  passportConfig.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      console.log("User authentication failed:", info.message);
      return res.render("login", {
        title: "Log In",
        errors: [{ msg: "Invalid username or password." }],
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).redirect("/");
    });
  })(req, res, next);
};

exports.logout_get = (req, res, next) => {
  res.render("logout", { title: "Log Out", errors: [] });
};

exports.logout_post = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
};

exports.search = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.render("search", {
      folders: [],
      files: [],
      title: "Search Results",
    });
  }

  try {
    const folders = await prisma.folder.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });

    const files = await prisma.file.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });

    res.render("search", {
      title: "Search Results",
      folders,
      files,
    });
  } catch (err) {
    console.log("Error searching for folders and files:", err);
    next(err);
  }
};
