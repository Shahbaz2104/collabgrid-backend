import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import prisma from './db'; 
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import boardRoutes from './routes/boardRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// Health-Check Route
app.get('/health', async (req: Request, res: Response) => {
    try {
        // Simple raw query check to verify database response
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "healthy", database: "connected" });
    } catch (error) {
        res.status(500).json({ status: "unhealthy", error: "Database unreachable" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 CollabGrid Engine live at http://localhost:${PORT}`);
});