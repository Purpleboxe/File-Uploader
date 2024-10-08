const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
    try {
      const folders = await prisma.folder.findMany({
        where: { userId: req.user.id },
      });
      return res.render("folder_form", {
        title: "Create New Folder",
        folders,
        errors: errors.array(),
      });
    } catch (err) {
      return next(err);
    }
  }

  const { folderName, parentFolder } = req.body;

  try {
    if (parentFolder) {
      const parent = await prisma.folder.findUnique({
        where: { id: parentFolder },
        select: { userId: true },
      });

      if (!parent || parent.userId !== req.user.id) {
        return res.status(403).redirect("/");
      }
    }

    await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
        parentId: parentFolder ? parentFolder : null,
      },
    });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.folder_detail = async (req, res, next) => {
  try {
    const folderId = req.params.id;

    const getFolderHierarchy = async (folderId) => {
      let folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { subfolders: true, parent: true, files: true },
      });

      if (!folder || folder.userId !== req.user.id) {
        return null;
      }

      const hierarchy = [];

      while (folder) {
        hierarchy.unshift(folder);

        if (folder.parent) {
          folder = await prisma.folder.findUnique({
            where: { id: folder.parentId },
            include: { files: true, parent: true, subfolders: true },
          });
        } else {
          folder = null;
        }
      }

      return hierarchy;
    };

    const folderHierarchy = await getFolderHierarchy(folderId);

    if (!folderHierarchy) {
      return res.status(403).redirect("/");
    }

    const folder = folderHierarchy[folderHierarchy.length - 1];

    res.render("folder_detail", {
      title: folder.name || "Folder",
      folder,
      folderHierarchy,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.update_put = async (req, res, next) => {
  const folderId = req.params.id;
  const { name } = req.body;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { userId: true },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).redirect("/");
    }

    await prisma.folder.update({
      where: { id: folderId },
      data: { name },
    });

    res.status(200).json({ message: "Folder updated successfully" });
  } catch (err) {
    console.error("Error updating folder:", err);
    res
      .status(500)
      .json({ error: "An error occurred while renaming the folder" });
  }
};

exports.delete_post = async (req, res, next) => {
  const folderId = req.params.id;

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { user: true, files: true },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).redirect("/");
    }

    const deleteFileFromSupabase = async (supabaseFilePath) => {
      const { data, error } = await supabase.storage
        .from("files")
        .remove([supabaseFilePath]);
      if (error) {
        console.error("Error deleting file from Supabase:", error);
      }
    };

    const deleteAllRecursive = async (folderId) => {
      folder.files.forEach((file) => {
        const filePath = path.join(__dirname, "../", file.url);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        const supabaseFilePath = file.url.split("files/")[1];
        deleteFileFromSupabase(supabaseFilePath);
      });

      const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId },
      });

      for (const subfolder of subfolders) {
        await deleteAllRecursive(subfolder.id);
      }

      await prisma.folder.delete({
        where: { id: folderId },
      });
    };

    await deleteAllRecursive(folderId);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting folder:", err);
    next(err);
  }
};
