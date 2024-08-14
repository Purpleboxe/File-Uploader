const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const crypto = require("crypto");

const secret = crypto.randomBytes(64).toString("hex");

// routes
const indexRouter = require("./routes/index");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// session middleware setup
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
  })
);

// mount routes
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("File Uploader Started!"));
