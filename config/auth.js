module.exports = {
  auth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    return next();
  },

  notAuth: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return res.redirect("/");
    }
    return next();
  },
};
