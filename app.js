const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const createError = require("http-errors");
const partials = require("express-partials");

const crypto = require("crypto");
const secret = crypto.randomBytes(64).toString("hex");

// routes
const indexRouter = require("./routes/index");
const fileRouter = require("./routes/fileRoutes");
const folderRouter = require("./routes/folderRoutes");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(partials());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const prisma = new PrismaClient();

// session middleware setup
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware to set user and folders in locals
app.use(async (req, res, next) => {
  res.locals.user = req.user;

  if (req.user) {
    try {
      const folders = await prisma.folder.findMany({
        where: { userId: req.user.id },
      });
      // Parent folders with the highest priority (Doesn't have a parent folder)
      const topFolders = await prisma.folder.findMany({
        where: { userId: req.user.id, parentId: null },
      });
      res.locals.folders = folders;
      res.locals.topFolders = topFolders;
    } catch (err) {
      console.error("Error fetching folders:", err);
      res.locals.folders = [];
      res.locals.topFolders = [];
    }
  } else {
    res.locals.folders = [];
    res.locals.topFolders = [];
  }

  next();
});

// mount routes
app.use("/", indexRouter);
app.use("/file", fileRouter);
app.use("/folder", folderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Set the status code
  res.status(err.status || 500);

  // Render the error page and pass status and message variables
  res.render("error", {
    status: err.status || 500,
    message: err.message,
    title: "Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("File Uploader Started!"));
