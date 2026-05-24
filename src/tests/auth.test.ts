import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../routes/authRoutes';
import userRoutes from '../routes/userRoutes';
import boardRoutes from '../routes/boardRoutes';
import taskRoutes from '../routes/taskRoutes';
import prisma from '../db';

// 1. Setup a clean, isolated Express instance containing the entire API grid
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

describe('🚀 CollabGrid Comprehensive System Integration Tests', () => {
  // Generate unique credentials for isolation across multiple test runs
  const memberEmail = `member-${Date.now()}@collabgrid.com`;
  const adminEmail = `admin-${Date.now()}@collabgrid.com`;
  const testPassword = 'SuperSecurePassword123';

  let memberToken = '';
  let adminToken = '';
  let targetBoardId: number;
  let toDoColumnId: number;
  let inProgressColumnId: number;
  let targetTaskId: number;

  // Clean up global database connections safely after all test sequences execute
  afterAll(async () => {
    // Optional: Clean up test records to avoid filling your dev database with test spam
    await prisma.task.deleteMany({ where: { title: 'Test Task' } }).catch(() => {});
    await prisma.board.deleteMany({ where: { name: 'Integration Test Workspace Board' } }).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { in: [memberEmail, adminEmail] } } }).catch(() => {});
    
    await prisma.$disconnect();
  });

  // ==========================================
  // 🔐 PHASE 1: AUTHENTICATION & VALIDATION
  // ==========================================

  it('✅ POST /api/auth/register -> Should register a standard Member successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: memberEmail, password: testPassword });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('role', 'Member');
  });

  it('❌ POST /api/auth/register -> Should reject duplicate registrations instantly', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: memberEmail, password: testPassword });

    expect(response.status).toBe(409);
  });

  it('✅ POST /api/auth/login -> Should authenticate Member and return a valid JWT', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: memberEmail, password: testPassword });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    memberToken = response.body.token; // Save token for downstream resource tests
  });

  // ==========================================
  // 📋 PHASE 2: KANBAN WORKSPACE LIFECYCLE
  // ==========================================

  it('✅ POST /api/boards -> Should create a board and auto-seed To Do, In Progress, Done columns', async () => {
    const response = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Integration Test Workspace Board' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('board');
    targetBoardId = response.body.board.id;
  });

  it('🔍 GET /api/boards -> Should fetch user workspace layout with nested column structures', async () => {
    const response = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.boards)).toBe(true);
    
    // Find our newly created board from the array
    const activeBoard = response.body.boards.find((b: any) => b.id === targetBoardId);
    expect(activeBoard).toBeDefined();
    expect(activeBoard.columns.length).toBe(3); // Verifies transaction column auto-seeding
    
    // Snag column ids for task injection parameters
    toDoColumnId = activeBoard.columns.find((c: any) => c.name === 'To Do').id;
    inProgressColumnId = activeBoard.columns.find((c: any) => c.name === 'In Progress').id;
  });

  // ==========================================
  // 📍 PHASE 3: TASK MANIPULATION & STATE TRACKING
  // ==========================================

  it('✅ POST /api/tasks -> Should inject a new task card inside the To Do column', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Test Task',
        description: 'Verify drag drop persistence flows',
        columnId: toDoColumnId,
        position: 0
      });

    expect(response.status).toBe(201);
    expect(response.body.task).toHaveProperty('id');
    expect(response.body.task.columnId).toBe(toDoColumnId);
    targetTaskId = response.body.task.id;
  });

  it('🔄 PATCH /api/tasks/:id -> Should process task transition state from To Do to In Progress', async () => {
    const response = await request(app)
      .patch(`/api/tasks/${targetTaskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        columnId: inProgressColumnId,
        position: 0
      });

    expect(response.status).toBe(200);
    expect(response.body.task.columnId).toBe(inProgressColumnId); // State mutation confirmed!
  });

  // ==========================================
  // 🛡️ PHASE 4: ROLE-BASED ACCESS CONTROL (RBAC)
  // ==========================================

  it('❌ DELETE /api/boards/:id -> Should catch standard Member breach and return 403 Forbidden', async () => {
    const response = await request(app)
      .delete(`/api/boards/${targetBoardId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    // Member role lacks destructive delete privileges
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  it('🔓 DELETE /api/boards/:id -> Should let an authorized Admin user tear down workspace layout', async () => {
    // 1. Programmatically seed an Admin profile to test elevated execution
    // We pass a dummy string first to satisfy the Prisma TypeScript compiler
    const signupAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'temporary-placeholder-hash', 
        role: 'Admin' // Enforced role level override
      }
    });

    // Mirror the valid hashed password from the registered Member user so login succeeds
    const memberUser = await prisma.user.findUnique({ where: { email: memberEmail } });
    await prisma.user.update({
      where: { id: signupAdmin.id },
      data: { password: memberUser!.password } 
    });

    // 2. Obtain an active Admin token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: testPassword });
    adminToken = loginRes.body.token;

    // 3. Trigger destructive route using Admin credentials
    const response = await request(app)
      .delete(`/api/boards/${targetBoardId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});