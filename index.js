/*global process*/
require("babel-core/register")
require("dotenv").config()

import { MongoClient } from "mongodb"
import invoices from "./models/invoiceModel"
import budgets from "./models/budgetModel"
import COA from "./models/COAModel"
import projects from "./models/budgetModel"
import settings from "./models/AppSettingModel"
import receipts from "./models/receiptsModel"
import cashbook from "./models/cashbookModel"
import users from "./models/usersModel"

import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import morgan from "morgan"
import routes from "./routes/_routes"

const app = express()

app.use(cors())
process.env.NODE_ENV !== "prod" && app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3100

// Register api routes
app.use("/", routes)
//app.use("/api/v1/user", users)
//app.use("/status", express.static("build"))
//app.use("/", express.static("build"))
//routes(app)
app.use("*", (req, res) => res.status(404).json({ error: "not found" }))

MongoClient.connect(
  process.env.DB_URI,
  // TODO: Connection Pooling
  // Set the poolSize to 50 connections.  
  // TODO: Timeouts
  // Set the write timeout limit to 2500 milliseconds.
  { useNewUrlParser: true, poolSize: 50, wtimeout: 2500 }
)
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
  .then(async client => {
    await invoices.injectDB(client);
    await budgets.injectDB(client);
    await COA.injectDB(client);
    await projects.injectDB(client);
    await settings.injectDB(client);
    await receipts.injectDB(client);
    await cashbook.injectDB(client);
    await users.injectDB(client);

    
    app.listen(port, () => {
      console.log(`listening on port ${port}`)
    })
  })

  