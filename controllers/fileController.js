const express = require("express");
const upload = require("../config/multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

exports.upload = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send(err);
    }

    const folderId = parseInt(req.params.id, 10);

    try {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, userId: true },
      });

      if (!folder || folder.userId !== req.user.id) {
        return res.status(403).redirect("/");
      }

      const { filename, path, size } = req.file;

      await prisma.file.create({
        data: {
          name: filename,
          url: path,
          size: size,
          folderId: folder.id,
          userId: req.user.id,
        },
      });

      res.redirect(`/folder/${folder.id}`);
    } catch (err) {
      console.error("Error uploading file", err);
      next(err);
    }
  });
};

exports.download = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.fileId, 10);

    if (isNaN(fileId)) {
      return res.status(400).send("Invalid file ID");
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const filePath = path.join(__dirname, "../", file.url);

    res.download(filePath, file.name, (err) => {
      if (err) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};
