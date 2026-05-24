import { Router } from "express";

import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management API
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get All Orders (Admin Only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success get all orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", authenticate, adminOnly, getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get Order Detail (Admin Only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Success get order detail
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get("/:id", authenticate, adminOnly, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update Order Status (Admin Only)
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - SHIPPED
 *                   - COMPLETED
 *             required:
 *               - status
 *           example:
 *             status: SHIPPED
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status", authenticate, adminOnly, updateOrderStatus);

export default router;
