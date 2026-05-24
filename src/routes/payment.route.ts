import { Router } from "express";

import {
  handleNotification,
  getPaymentStatus,
  cancelPayment,
} from "../controllers/payment.controller";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Midtrans Payment API
 */

/**
 * @swagger
 * /api/payment/notification:
 *   post:
 *     summary: Midtrans Webhook Notification
 *     tags:
 *       - Payment
 *     responses:
 *       200:
 *         description: Notification processed successfully
 */
router.post("/notification", handleNotification);

/**
 * @swagger
 * /api/payment/status/{orderCode}:
 *   get:
 *     summary: Get Payment Status
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: string
 *         example: ORD-20260521213000-ABC123
 *     responses:
 *       200:
 *         description: Success get payment status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get("/status/:orderCode", authenticate, getPaymentStatus);

/**
 * @swagger
 * /api/payment/cancel/{orderCode}:
 *   post:
 *     summary: Cancel Payment (Admin Only)
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: string
 *         example: ORD-20260521213000-ABC123
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.post("/cancel/:orderCode", authenticate, adminOnly, cancelPayment);

export default router;
