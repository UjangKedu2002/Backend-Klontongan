import { Router } from "express";

import { login, register, getAllUsers } from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register User
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: UjangKedu123
 *               email:
 *                 type: string
 *                 example: UjangKedu123@gmail.com
 *               password:
 *                 type: string
 *                 example: UjangKedu123
 *     responses:
 *       201:
 *         description: Register success
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: UjangKedu123@gmail.com
 *               password:
 *                 type: string
 *                 example: UjangKedu123
 *     responses:
 *       200:
 *         description: Login success
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get All Users (Admin Only)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success get all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/users", authenticate, adminOnly, getAllUsers);

export default router;
