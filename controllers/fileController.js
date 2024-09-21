const express = require("express");
const upload = require("../config/multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

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

exports.update = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.fileId, 10);
    const { name } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    const oldPath = path.join(__dirname, "../uploads", file.name);
    const newPath = path.join(__dirname, "../uploads", name);

    fs.rename(oldPath, newPath, async (err) => {
      if (err) {
        return next(err);
      }

      await prisma.file.update({
        where: { id: fileId },
        data: { name: name, url: `/uploads/${name}` },
      });

      res.send("File updated successfully");
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
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

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, async (err) => {
        if (err) return next(err);

        await prisma.file.delete({
          where: { id: fileId },
        });

        res.send("File deleted successfully");
      });
    } else {
      await prisma.file.delete({
        where: { id: fileId },
      });

      res.send(
        "File deleted successfully, but file was not found in the filesystem"
      );
    }
  } catch (err) {
    next(err);
  }
};
