import swaggerJsdoc from "swagger-jsdoc";

const railwayUrl = "https://backend-klontongan-production.up.railway.app";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "E-Commerce Backend API Documentation",
    },

    servers: [
      {
        url: railwayUrl,
        description: "Production Server - Railway",
      },
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
