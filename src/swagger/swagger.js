import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dharashiv Loksabha API Documentation",
      version: "1.0.0",
      description: "Official API documentation for Dharashiv Loksabha Project",
    },
  },
  apis: [
    path.join(__dirname, "./routes/*.js"),
    path.join(__dirname, "./components/schemas/*.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  // Serve CSS file
  app.use("/swagger-custom.css", express.static(path.join(__dirname, "custom.css")));

  // Setup Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCssUrl: "/swagger-custom.css",
      customSiteTitle: "Dharashiv Loksabha API",
    })
  );

  console.log("Swagger Docs available at http://localhost:4000/api-docs");
};
