import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";

import authRoute from "./routes/auth.route";
import productRoute from "./routes/product.route";
import cartRoute from "./routes/cart.route";
import checkoutRoute from "./routes/checkout.route";
import paymentRoute from "./routes/payment.route";
import orderRoute from "./routes/order.route";
import dashboardRoute from "./routes/dashboard.route";
import uploadRoute from "./routes/upload.route";

import swaggerSpec from "./docs/swagger";

const app = express();

// MIDDLEWARE

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// SWAGGER

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ROUTES

app.use("/api/auth", authRoute);

app.use("/api/products", productRoute);

app.use("/api/cart", cartRoute);

app.use("/api/checkout", checkoutRoute);

app.use("/api/payment", paymentRoute);

app.use("/api/orders", orderRoute);

app.use("/api/dashboard", dashboardRoute);

app.use("/api/upload", uploadRoute);

// ROOT

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API Running",
  });
});

// 404 HANDLER

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// SERVER

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");

  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");

  console.log(
    "MIDTRANS_SERVER_KEY:",
    process.env.MIDTRANS_SERVER_KEY ? "Loaded" : "Missing"
  );

  console.log(
    "MIDTRANS_CLIENT_KEY:",
    process.env.MIDTRANS_CLIENT_KEY ? "Loaded" : "Missing"
  );

  console.log(
    "MIDTRANS_IS_PRODUCTION:",
    process.env.MIDTRANS_IS_PRODUCTION ?? "Missing"
  );

  console.log(
    "CLOUDINARY_CLOUD_NAME:",
    process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "Missing"
  );

  console.log(
    "CLOUDINARY_API_KEY:",
    process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing"
  );

  console.log(
    "CLOUDINARY_API_SECRET:",
    process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing"
  );

  console.log(`📖 Swagger Docs: http://localhost:${PORT}/api/docs`);
});

export default app;
