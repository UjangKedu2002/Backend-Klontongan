import { Router } from "express";

import { uploadImage } from "../controllers/upload.controller";

import upload from "../middleware/upload.middleware";

import { authenticate } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload Image API
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload Product Image (Admin Only)
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Image file is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post("/", authenticate, adminOnly, upload.single("image"), uploadImage);

export default router;
