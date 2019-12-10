/*global process*/
/*eslint no-undef: "error"*/

import express from "express";
var app = express();
var port = process.env.PORT || 3100;
import invoices from "./models/invoiceModel";
import budgets from "./models/usersModel";
import COA from "./models/CoursesModel";
import projects from "./models/AttendanceModel";
import settings from "./models/AppSettingModel";
import receipts from "./models/receiptModel";
import cashbook from "./models/cashbookModel";
import { MongoClient } from "mongodb";

MongoClient.connect(
  process.env.DB_URI,
  // TODO: Connection Pooling
  // Set the poolSize to 50 connections.
  // TODO: Timeouts
  // Set the write timeout limit to 2500 milliseconds.
  { useNewUrlParser: true, poolSize: 50, wtimeout: 2500 }
)
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async client => {
    await invoices.injectDB(client);
    await budgets.injectDB(client);
    await COA.injectDB(client);
    await projects.injectDB(client);
    await settings.injectDB(client);
    await receipts.injectDB(client);
    await cashbook.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
