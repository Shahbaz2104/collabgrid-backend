import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Force environment variables to load before instantiating
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;