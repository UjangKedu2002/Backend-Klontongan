import { Router } from "express";

import {
  checkout,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderById,
} from "../controllers/checkout.controller";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout & Order API
 */

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Checkout User Cart
 *     tags:
 *       - Checkout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Checkout successful
 *       400:
 *         description: Cart is empty or stock insufficient
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, checkout);

/**
 * @swagger
 * /api/checkout/my-orders:
 *   get:
 *     summary: Get My Orders
 *     tags:
 *       - Checkout
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success get my orders
 *       401:
 *         description: Unauthorized
 */
router.get("/my-orders", authenticate, getMyOrders);

/**
 * @swagger
 * /api/checkout/my-orders/{id}:
 *   get:
 *     summary: Get My Order Detail
 *     tags:
 *       - Checkout
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
 *         description: Success get my order detail
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get("/my-orders/:id", authenticate, getMyOrderById);

/**
 * @swagger
 * /api/checkout/orders:
 *   get:
 *     summary: Get All Orders (Admin Only)
 *     tags:
 *       - Checkout
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
router.get("/orders", authenticate, adminOnly, getAllOrders);

/**
 * @swagger
 * /api/checkout/orders/{id}:
 *   get:
 *     summary: Get Order Detail (Admin Only)
 *     tags:
 *       - Checkout
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
router.get("/orders/:id", authenticate, adminOnly, getOrderById);

export default router;
