import { Request, Response } from "express";
import crypto from "crypto";

import prisma from "../lib/prisma";

import {
  getTransactionStatus,
  cancelTransaction,
  mapMidtransStatusToOrderStatus,
} from "../services/payment.service";

// MIDTRANS WEBHOOK
export const handleNotification = async (
  req: Request,
  res: Response
): Promise<any> => {
  console.log("========== MIDTRANS WEBHOOK ==========");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  try {
    const notification = req.body;

    if (!notification || Object.keys(notification).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Notification body is required",
      });
    }

    const orderCode = String(notification.order_id || "");

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: "Order ID not found",
      });
    }

    console.log("ORDER CODE:", orderCode);

    // VERIFY MIDTRANS SIGNATURE
    const signatureKey = crypto
      .createHash("sha512")
      .update(
        orderCode +
          notification.status_code +
          notification.gross_amount +
          process.env.MIDTRANS_SERVER_KEY
      )
      .digest("hex");

    console.log("SIGNATURE MIDTRANS :", notification.signature_key);
    console.log("SIGNATURE SERVER   :", signatureKey);

    if (signatureKey !== notification.signature_key) {
      return res.status(403).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // GET REAL STATUS FROM MIDTRANS
    const transaction = await getTransactionStatus(orderCode);

    console.log("TRANSACTION:", transaction);

    const transactionStatus = String(transaction.transaction_status || "");

    const paymentType = transaction.payment_type
      ? String(transaction.payment_type)
      : null;

    const transactionId = transaction.transaction_id
      ? String(transaction.transaction_id)
      : null;

    const orderStatus = mapMidtransStatusToOrderStatus(transactionStatus);

    console.log("ORDER STATUS:", orderStatus);

    // FIND ORDER
    const order = await prisma.order.findUnique({
      where: {
        orderCode,
      },

      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // PREVENT DUPLICATE PROCESSING
    if (order.status === "PAID" && orderStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Order already processed",
      });
    }

    // UPDATE ORDER
    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        status: orderStatus,
        paymentMethod: paymentType,
        transactionId,
      },
    });

    // REDUCE STOCK ONLY ON FIRST SUCCESS PAYMENT
    if (orderStatus === "PAID" && order.status !== "PAID") {
      for (const item of order.items) {
        await prisma.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      console.log("STOCK UPDATED");
    }

    return res.status(200).json({
      success: true,
      message: "Notification processed successfully",
    });
  } catch (error: any) {
    console.error("MIDTRANS NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET PAYMENT STATUS
export const getPaymentStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const orderCode = String(req.params.orderCode);

    const order = await prisma.order.findUnique({
      where: {
        orderCode,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const transaction = await getTransactionStatus(orderCode);

    return res.status(200).json({
      success: true,
      order,
      transaction,
    });
  } catch (error: any) {
    console.error("GET PAYMENT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// CANCEL PAYMENT
export const cancelPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const orderCode = String(req.params.orderCode);

    const order = await prisma.order.findUnique({
      where: {
        orderCode,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await cancelTransaction(orderCode);

    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        status: "CANCELLED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
    });
  } catch (error: any) {
    console.error("CANCEL PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
