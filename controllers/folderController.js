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
        parentId: parentFolder ? parseInt(parentFolder, 10) : null,
      },
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.folder_detail = async (req, res) => {
  try {
    const getFolderHierarchy = async (folderId) => {
      let folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { parent: true },
      });

      const hierarchy = [];

      while (folder) {
        hierarchy.unshift(folder);

        if (folder.parent) {
          folder = await prisma.folder.findUnique({
            where: { id: folder.parentId },
            include: { parent: true },
          });
        } else {
          folder = null;
        }
      }

      return hierarchy;
    };

    const folderId = parseInt(req.params.id, 10);
    const folderHierarchy = await getFolderHierarchy(folderId);

    res.render("folder_detail", {
      title: folderHierarchy[folderHierarchy.length - 1]?.name || "Folder",
      folder: folderHierarchy[folderHierarchy.length - 1],
      folderHierarchy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("500", { title: "Server Error" });
  }
};
