import { snap, coreApi } from "../lib/midtrans";

interface CreatePaymentPayload {
  orderCode: string;
  totalPrice: number;

  customer: {
    firstName: string;
    email: string;
  };
}

export const createSnapTransaction = async (payload: CreatePaymentPayload) => {
  const parameter = {
    transaction_details: {
      order_id: payload.orderCode,
      gross_amount: payload.totalPrice,
    },

    customer_details: {
      first_name: payload.customer.firstName,
      email: payload.customer.email,
    },

    enabled_payments: ["qris", "gopay", "bank_transfer", "shopeepay"],
  };

  const transaction = await snap.createTransaction(parameter);

  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
};

export const getTransactionStatus = async (orderCode: string) => {
  const transaction = await coreApi.transaction.status(orderCode);

  return transaction;
};

export const cancelTransaction = async (orderCode: string) => {
  const transaction = await coreApi.transaction.cancel(orderCode);

  return transaction;
};

export const mapMidtransStatusToOrderStatus = (
  transactionStatus: string
): "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "SHIPPED" | "COMPLETED" => {
  switch (transactionStatus) {
    case "capture":
    case "settlement":
      return "PAID";

    case "deny":
    case "expire":
      return "FAILED";

    case "cancel":
      return "CANCELLED";

    case "pending":
    default:
      return "PENDING";
  }
};
