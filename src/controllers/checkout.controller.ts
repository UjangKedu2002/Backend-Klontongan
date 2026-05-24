import { Response } from "express";

import prisma from "../lib/prisma";

import { AuthRequest } from "../middleware/auth.middleware";

import { generateOrderCode } from "../utils/orderCode";

import { createSnapTransaction } from "../services/payment.service";

// USER CHECKOUT
// USER CHECKOUT
export const checkout = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    // GET USER
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // GET USER CART
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
    });

    // CHECK EMPTY CART
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // VALIDATE PRODUCT & STOCK
    for (const item of cartItems) {
      if (!item.product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.product.name}`,
        });
      }
    }

    // CALCULATE TOTAL PRICE
    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // GENERATE ORDER CODE
    const orderCode = generateOrderCode();

    // CREATE SNAP TRANSACTION
    const payment = await createSnapTransaction({
      orderCode,

      totalPrice,

      customer: {
        firstName: user.name,
        email: user.email,
      },
    });

    // CREATE ORDER
    const order = await prisma.order.create({
      data: {
        orderCode,

        userId: Number(userId),

        totalPrice,

        status: "PENDING",

        paymentToken: payment.token,

        paymentUrl: payment.redirectUrl,

        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),

        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,

            quantity: item.quantity,

            price: item.product.price,
          })),
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // CLEAR USER CART
    // STOCK BELUM DIKURANGI
    // STOCK AKAN DIKURANGI SAAT PAYMENT SUCCESS
    await prisma.cart.deleteMany({
      where: {
        userId: Number(userId),
      },
    });

    return res.status(201).json({
      success: true,

      message: "Checkout created successfully",

      snapToken: payment.token,

      paymentUrl: payment.redirectUrl,

      order,
    });
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",

      error: error.message,
    });
  }
};

// USER GET MY ORDERS
export const getMyOrders = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const orders = await prisma.order.findMany({
      where: {
        userId: Number(userId),
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// USER GET MY ORDER DETAIL
export const getMyOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("GET MY ORDER DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ADMIN GET ALL ORDERS
export const getAllOrders = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ADMIN GET ORDER DETAIL
export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("GET ORDER DETAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
