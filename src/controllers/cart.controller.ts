import { Response } from "express";

import prisma from "../lib/prisma";

import { AuthRequest } from "../middleware/auth.middleware";

// ADD TO CART
export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const { productId, quantity } = req.body;

    // VALIDATION
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const qty = quantity ? Number(quantity) : 1;

    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // CHECK PRODUCT
    const product = await prisma.product.findUnique({
      where: {
        id: Number(productId),
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // CHECK STOCK
    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: "Insufficient product stock",
      });
    }

    // CHECK EXISTING CART
    const existingCart = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId: Number(userId),
          productId: Number(productId),
        },
      },
    });

    // IF PRODUCT ALREADY EXISTS IN CART
    if (existingCart) {
      const newQuantity = existingCart.quantity + qty;

      // CHECK STOCK AGAIN
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Quantity exceeds available stock",
        });
      }

      const updatedCart = await prisma.cart.update({
        where: {
          id: existingCart.id,
        },

        data: {
          quantity: newQuantity,
        },

        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        cart: {
          ...updatedCart,
          subtotal: updatedCart.product.price * updatedCart.quantity,
        },
      });
    }

    // CREATE CART
    const cart = await prisma.cart.create({
      data: {
        userId: Number(userId),
        productId: Number(productId),
        quantity: qty,
      },

      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      cart: {
        ...cart,
        subtotal: cart.product.price * cart.quantity,
      },
    });
  } catch (error: any) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET USER CART
export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const cartItems = await prisma.cart.findMany({
      where: {
        userId: Number(userId),
      },

      include: {
        product: {
          include: {
            category: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // ADD SUBTOTAL
    const formattedCartItems = cartItems.map((item) => ({
      ...item,
      subtotal: item.product.price * item.quantity,
    }));

    // CALCULATE TOTAL PRICE
    const totalPrice = formattedCartItems.reduce((total, item) => {
      return total + item.subtotal;
    }, 0);

    return res.status(200).json({
      success: true,
      totalItems: formattedCartItems.length,
      totalPrice,
      cartItems: formattedCartItems,
    });
  } catch (error: any) {
    console.error("GET CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE CART QUANTITY
export const updateCartQuantity = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const { id } = req.params;

    const { quantity } = req.body;

    const qty = Number(quantity);

    // VALIDATION
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // CHECK CART
    const cart = await prisma.cart.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },

      include: {
        product: true,
      },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // CHECK STOCK
    if (qty > cart.product.stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity exceeds available stock",
      });
    }

    // UPDATE CART
    const updatedCart = await prisma.cart.update({
      where: {
        id: Number(id),
      },

      data: {
        quantity: qty,
      },

      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart: {
        ...updatedCart,
        subtotal: updatedCart.product.price * updatedCart.quantity,
      },
    });
  } catch (error: any) {
    console.error("UPDATE CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// REMOVE CART ITEM
export const removeCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const { id } = req.params;

    // CHECK CART
    const cart = await prisma.cart.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // DELETE CART ITEM
    await prisma.cart.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error: any) {
    console.error("REMOVE CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// CLEAR USER CART
export const clearCart = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    await prisma.cart.deleteMany({
      where: {
        userId: Number(userId),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error: any) {
    console.error("CLEAR CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
