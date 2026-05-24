import { Router } from "express";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart API
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add Product To Cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: number
 *                 example: 1
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Product added to cart
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post("/", authenticate, addToCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get User Cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success get user cart
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Update Cart Quantity
 *     tags:
 *       - Cart
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart quantity updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.put("/:id", authenticate, updateCartQuantity);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Remove Cart Item
 *     tags:
 *       - Cart
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
 *         description: Cart item removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
router.delete("/:id", authenticate, removeCartItem);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear User Cart
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/clear", authenticate, clearCart);

export default router;
