/*global process*/
import 'dotenv/config';
import MongoClient from "mongodb";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

//routes and models
import routes from "./routes/_routes.js";
import invoices from "./models/invoiceModel.js";
import budgets from "./models/budgetModel.js";
import COA from "./models/COAModel.js";
import projects from "./models/budgetModel.js";
import settings from "./models/AppSettingModel.js";
import receipts from "./models/receiptsModel.js";
import cashbook from "./models/cashbookModel.js";
import users from "./models/usersModel.js";
import resume_profile from "./models/resume_profile.js";
//import seeder from "./models/seeder.js";

const app = express();

app.use(cors());
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;
// Register api routes
app.use("/", routes);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

MongoClient.connect(
  process.env.DB_URI,
  // TODO: Connection Pooling
  // Set the poolSize to 50 connections.
  // TODO: Timeouts
  // Set the write timeout limit to 2500 milliseconds.
  { useNewUrlParser: true, poolSize: 50, useUnifiedTopology: true }
).catch(err => {
    console.error(err.stack);
    process.exit(1);
}).then(async client => {
  const dbName = process.env.DB_NAME || 'db';
  const db = client.db(dbName);

  await invoices.injectDB(db);
  await budgets.injectDB(db);
  await COA.injectDB(db);
  await projects.injectDB(db);
  await settings.injectDB(db);
  await receipts.injectDB(db);
  await resume_profile.injectDB(db);
  await cashbook.injectDB(db);
  await users.injectDB(db);
    //await seeder.seedDB("apene", "COA", process.env.DB_URI)

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });

});
