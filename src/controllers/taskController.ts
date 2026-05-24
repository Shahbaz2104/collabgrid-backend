import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../db';

// 1. CREATE A NEW TASK
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, columnId, position } = req.body;

  if (!title || !columnId) {
    return res.status(400).json({ error: "Title and columnId fields are required." });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        columnId: Number(columnId),
        position: position !== undefined ? Number(position) : 0, // Fallback to 0 if not specified
      },
    });

    return res.status(201).json({
      message: "Task created successfully.",
      task: newTask,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create task record." });
  }
};

// 2. UPDATE OR MOVE A TASK
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, columnId, position } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(columnId && { columnId: Number(columnId) }),
        ...(position !== undefined && { position: Number(position) }),
      },
    });

    return res.status(200).json({
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update task state." });
  }
};