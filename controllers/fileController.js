const express = require("express");
const upload = require("../config/multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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

      const { originalname, buffer, mimetype } = req.file;
      const filePath = `uploads/${req.user.id}/${originalname}`;

      const { data, error } = await supabase.storage
        .from("files")
        .upload(filePath, buffer, {
          contentType: mimetype,
          upsert: true,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error("Supabase upload failed");
      }

      const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/files/${filePath}`;

      await prisma.file.create({
        data: {
          name: originalname,
          url: url,
          size: buffer.length,
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

    const filePath = file.url.split("files/")[1];

    console.log(`Attempting to download file from path: ${filePath}`);

    const { data, error } = await supabase.storage
      .from("files")
      .download(filePath);

    if (error) {
      console.error("Supabase download error:", error);
      throw new Error("Error downloading file from Supabase");
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", file.mimetype || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);

    res.send(buffer);
  } catch (err) {
    console.error("Error downloading file", err);
    res.status(500).send("Sorry, looks like you encountered an error.");
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

    const newFileName = name;
    const newFilePath = `uploads/${req.user.id}/${newFileName}`;
    const oldFilePath = file.url.split("files/")[1];

    const { error } = await supabase.storage
      .from("files")
      .move(oldFilePath, newFilePath);

    if (error) {
      return next(error);
    }

    await prisma.file.update({
      where: { id: fileId },
      data: {
        name: newFileName,
        url: `${process.env.SUPABASE_URL}/storage/v1/object/public/files/${newFilePath}`,
      },
    });

    res.send("File updated successfully");
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

    const filePath = file.url.split("files/")[1];

    const { error } = await supabase.storage.from("files").remove([filePath]);

    if (error) {
      return next(error);
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    res.send("File deleted successfully");
  } catch (err) {
    next(err);
  }
};
