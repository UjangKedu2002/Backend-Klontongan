import dotenv from "dotenv";
dotenv.config();

import midtransClient from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey) {
  throw new Error("MIDTRANS_SERVER_KEY is missing");
}

if (!clientKey) {
  throw new Error("MIDTRANS_CLIENT_KEY is missing");
}

// SNAP CONFIGURATION
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey,
  clientKey,
});

// CORE API CONFIGURATION
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey,
  clientKey,
});

export { snap, coreApi };
