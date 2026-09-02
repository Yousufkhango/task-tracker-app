// routes/tasks.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// Apply the authentication middleware to ALL task routes below
router.use(authenticateToken);

// ==========================================
// 1. GET ALL TASKS (For Logged-in User Only)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId }, // Filter strictly by the logged-in user!
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// ==========================================
// 2. CREATE A NEW TASK
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        userId: req.userId, // Links task to the user ID extracted by middleware
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// ==========================================
// 3. UPDATE TASK (Mark completed or edit details)
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, completed } = req.body;

    // Security Check: Verify task exists AND belongs to the logged-in user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: req.userId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        completed: completed !== undefined ? completed : existingTask.completed,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// ==========================================
// 4. DELETE A TASK
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    // Security Check: Verify task exists AND belongs to the logged-in user
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId: req.userId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

module.exports = router;