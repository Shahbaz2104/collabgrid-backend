import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../db';

// 1. CREATE A NEW BOARD WITH DEFAULT COLUMNS
export const createBoard = async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.user?.userId;

  if (!name) {
    return res.status(400).json({ error: "Board name field is required." });
  }

  try {
    // Execute a transaction so the board and default columns are created together safely
    const newBoard = await prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name,
          userId: userId!,
        },
      });

      // Seed standard interactive columns immediately
      await tx.column.createMany({
        data: [
          { name: 'To Do', position: 0, boardId: board.id },
          { name: 'In Progress', position: 1, boardId: board.id },
          { name: 'Done', position: 2, boardId: board.id },
        ],
      });

      return board;
    });

    return res.status(201).json({
      message: "Kanban board provisioned successfully with default columns.",
      board: newBoard,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error spinning up board infrastructure." });
  }
};

// 2. GET ALL BOARDS FOR THE LOGGED-IN USER
export const getUserBoards = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    const boards = await prisma.board.findMany({
      where: { userId },
      include: {
        columns: {
          include: {
            tasks: true, // Deep-fetch tasks inside columns automatically
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return res.status(200).json({ boards });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user project workspace layout." });
  }
};


export const deleteBoard = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.board.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Board and all its associated columns/tasks deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete the specified board." });
  }
};