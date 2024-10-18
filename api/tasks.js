const express = require("express");
const router = express.Router();
module.exports = router;

const { authenticate } = require("./auth");
const prisma = require("../prisma");

router.get("/", authenticate, async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { ownerId: req.user.id },
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  const { name } = req.body;
  try {
    const task = await prisma.task.create({
      data: { name, ownerId: req.user.id },
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { name, done } = req.body;
  try {
    const task = await prisma.task.findUnique({
      where: { id: +id },
    });
    if (task.ownerId != req.user.id) {
      next({ status: 403, message: "You do not own this task" });
    }
    const updatedTask = await prisma.task.update({
      where: { id: +id },
      data: { name, done },
    });
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id: +id } });
    if (task.ownerId != req.user.id) {
      next({ status: 403, message: "You do not own this task" });
    }
    await prisma.task.delete({ where: { id: +id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
