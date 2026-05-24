import { Request, Response } from "express";

import prisma from "../lib/prisma";

import { OrderStatus } from "@prisma/client";

// GET ALL ORDERS (ADMIN)
export const getAllOrders = async (
  _req: Request,
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

// GET ORDER DETAIL (ADMIN)
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: {
        id,
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

// UPDATE ORDER STATUS (ADMIN)
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses: OrderStatus[] = ["SHIPPED", "COMPLETED"];

    if (!allowedStatuses.includes(status as OrderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: SHIPPED, COMPLETED",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Hanya order yang sudah dibayar yang boleh dikirim
    if (status === "SHIPPED" && order.status !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Only PAID orders can be updated to SHIPPED",
      });
    }

    // Hanya order yang sudah dikirim yang boleh selesai
    if (status === "COMPLETED" && order.status !== "SHIPPED") {
      return res.status(400).json({
        success: false,
        message: "Only SHIPPED orders can be updated to COMPLETED",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },

      data: {
        status: status as OrderStatus,
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

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
