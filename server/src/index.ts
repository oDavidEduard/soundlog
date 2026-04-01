import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json())

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', project: 'soundlog'})
})

app.get('/health/db', async (_req, res) => {
    try{
        await prisma.$queryRaw`SELECT 1`
        res.json({ status: 'ok', db: 'connected'})
    } catch (e) {
        res.status(500).json({ status: 'error', db: 'disconnected'})
    }
})

app.use('/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

export default app