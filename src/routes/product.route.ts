import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create Product (Admin Only)
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gaming Mouse RGB
 *               description:
 *                 type: string
 *                 example: Mouse gaming terbaik
 *               price:
 *                 type: number
 *                 example: 250000
 *               stock:
 *                 type: number
 *                 example: 10
 *               image:
 *                 type: string
 *                 example: https://example.com/mouse.jpg
 *               categoryId:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post("/", authenticate, adminOnly, createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get All Products
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: Success get all products
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get Product By ID
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Success get product detail
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update Product (Admin Only)
 *     tags:
 *       - Product
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put("/:id", authenticate, adminOnly, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete Product (Admin Only)
 *     tags:
 *       - Product
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
 *         description: Product deleted successfully
 */
router.delete("/:id", authenticate, adminOnly, deleteProduct);

export default router;
