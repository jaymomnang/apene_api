/*global process*/
import 'dotenv/config';
import MongoClient from "mongodb";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Routes & models
import routes from "./routes/_routes.js";
import invoices from "./models/invoiceModel.js";
import budgets from "./models/budgetModel.js";
import COA from "./models/COAModel.js";
import projects from "./models/projectsModel.js";
import settings from "./models/AppSettingModel.js";
import receipts from "./models/receiptsModel.js";
import cashbook from "./models/cashbookModel.js";
import users from "./models/usersModel.js";
import resume_profile from "./models/resume_profile.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);
app.use((req, res) => res.status(404).json({ error: "not found" }));

// Database configuration
const dbName = process.env.DB_NAME || "db"; // 👈 You can set DB_NAME in .env

// Start server
const startServer = async () => {
  try {
    const client = await MongoClient.connect(process.env.DB_URI, {
      maxPoolSize: 50,
      socketTimeoutMS: 2500,
    });

    const db = client; //.db(dbName); // 👈 explicitly select the database

    // Inject DB into models
    await invoices.injectDB(db);
    await budgets.injectDB(db);
    await COA.injectDB(db);
    await projects.injectDB(db);
    await settings.injectDB(db);
    await receipts.injectDB(db);
    await resume_profile.injectDB(db);
    await cashbook.injectDB(db);
    await users.injectDB(db);

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();
