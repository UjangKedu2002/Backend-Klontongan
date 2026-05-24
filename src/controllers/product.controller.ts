import { Request, Response } from "express";

import prisma from "../lib/prisma";

import { generateSlug } from "../utils/slug";

// CREATE PRODUCT (ADMIN)
export const createProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name, description, price, stock, image, categoryId } = req.body;

    if (!name || !description || !price || stock === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const slug = generateSlug(name);

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    // CREATE PRODUCT
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        stock: Number(stock),
        image,
        categoryId: Number(categoryId),
      },

      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error: any) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET PRODUCT BY ID
export const getProductById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("GET PRODUCT DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE PRODUCT (ADMIN)
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const { name, description, price, stock, image, categoryId } = req.body;

    // CHECK PRODUCT
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // GENERATE SLUG
    const slug = generateSlug(name);

    // UPDATE
    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },

      data: {
        name,
        slug,
        description,
        price: Number(price),
        stock: Number(stock),
        image,
        categoryId: Number(categoryId),
      },

      include: {
        category: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// DELETE PRODUCT (ADMIN)
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // CHECK PRODUCT
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // DELETE PRODUCT
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
