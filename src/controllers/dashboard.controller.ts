import { Request, Response } from "express";

import prisma from "../lib/prisma";

// GET DASHBOARD STATISTICS
export const getDashboardStats = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    // TOTAL REVENUE
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },

      where: {
        status: {
          in: ["PAID", "SHIPPED", "COMPLETED"],
        },
      },
    });

    // TOTAL COUNTS
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      paidOrders,
      shippedOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count(),

      prisma.user.count(),

      prisma.product.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "PAID",
        },
      }),

      prisma.order.count({
        where: {
          status: "SHIPPED",
        },
      }),

      prisma.order.count({
        where: {
          status: "COMPLETED",
        },
      }),
    ]);

    // MONTHLY REVENUE
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = await prisma.$queryRaw<
      {
        month: number;
        revenue: bigint;
      }[]
    >`
      SELECT
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        COALESCE(SUM("totalPrice"), 0)::bigint AS revenue
      FROM "Order"
      WHERE
        EXTRACT(YEAR FROM "createdAt") = ${currentYear}
        AND status IN ('PAID', 'SHIPPED', 'COMPLETED')
      GROUP BY month
      ORDER BY month ASC
    `;

    return res.status(200).json({
      success: true,

      data: {
        revenue: Number(revenueResult._sum.totalPrice || 0),

        totalOrders,

        totalUsers,

        totalProducts,

        orderStatus: {
          pending: pendingOrders,

          paid: paidOrders,

          shipped: shippedOrders,

          completed: completedOrders,
        },

        monthlyRevenue: monthlyRevenue.map((item) => ({
          month: item.month,

          revenue: Number(item.revenue),
        })),
      },
    });
  } catch (error: any) {
    console.error("GET DASHBOARD STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
