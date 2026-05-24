import { Router } from "express";

import { getDashboardStats } from "../controllers/dashboard.controller";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard Statistics API
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get Dashboard Statistics (Admin Only)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", authenticate, adminOnly, getDashboardStats);

export default router;
