const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.create_get = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.redirect("/login");
  }

  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });
    res.render("folder_form", {
      title: "Create New Folder",
      folders,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
};

exports.create_post = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.redirect("/login");
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });
    return res.render("folder_form", {
      title: "Create New Folder",
      folders,
      errors: errors.array(),
    });
  }

  const { folderName, parentFolder } = req.body;

  try {
    await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
        parentId: parentFolder || null,
      },
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
