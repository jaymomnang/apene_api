import { Router } from "express"
import appSettingsCTRL from "../controllers/AppSettingController.js"
import usersCTRL from "../controllers/userController.js"
import invoicesCTRL from "../controllers/invoiceController.js"
import coaCTRL from "../controllers/COAController.js"
import budgetCTRL from "../controllers/budgetController.js"
import budgetStateCTRL from "../controllers/budgetStateController.js"

const router = new Router()

//default route
router.route("/").get(appSettingsCTRL.getAppSettings)

// routes for app settings
router.route("/settings/").get(appSettingsCTRL.getAppSettings)
router.route("/settings/search").get(appSettingsCTRL.searchAppSettings)
router.route("/settings/facet-search").get(appSettingsCTRL.facetedSearch)
router.route("/settings/id/:id").get(appSettingsCTRL.getAppSettingById)
router.route("/settings/config-options").get(appSettingsCTRL.getConfig)

// routes for app users
router.route("/people/").get(usersCTRL.getusers)
router.route("/signup/").post(usersCTRL.signup)
router.route("/people/search").get(usersCTRL.searchusers)
router.route("/people/facet-search").get(usersCTRL.facetedSearch)
router.route("/people/getuser/:email").get(usersCTRL.getuserById)
router.route("/people/auth/:email/:token").get(usersCTRL.getuser)
router.route("/people/config-options").get(usersCTRL.getConfig)

// routes for invoices
router.route("/inv/").get(invoicesCTRL.getInvoices)
router.route("/inv/search").get(invoicesCTRL.searchinvoices)
router.route("/inv/facet-search").get(invoicesCTRL.facetedSearch)
router.route("/inv/id/:id").get(invoicesCTRL.getinvoiceById)
router.route("/inv/config-options").get(invoicesCTRL.getConfig)

// routes for charts of accounts
router.route("/coa/").get(coaCTRL.getCOA)
router.route("/coa/search").get(coaCTRL.searchCOA)
router.route("/coa/facet-search").get(coaCTRL.facetedSearch)
router.route("/coa/id/:id").get(coaCTRL.getCOAByID)
router.route("/coa/config-options").get(coaCTRL.getConfig)

// routes for budgets
router.route("/budget/").get(budgetCTRL.getBudgets)
router.route("/budget/search").get(budgetCTRL.searchbudget)
router.route("/budget/facet-search").get(budgetCTRL.facetedSearch)
router.route("/budget/id/:id").get(budgetCTRL.getbudgetByID)
router.route("/budget/config-options").get(budgetCTRL.getConfig)

// routes for budgets states
router.route("/bs/").get(budgetStateCTRL.getbudgetStates)
router.route("/bs/search").get(budgetStateCTRL.searchbudgetState)
router.route("/bs/facet-search").get(budgetStateCTRL.facetedSearch)
router.route("/bs/id/:id").get(budgetStateCTRL.getbudgetStateByID)
router.route("/bs/cc/:budgetID/:id").get(budgetStateCTRL.getCostCenterByID)
router.route("/bs/config-options").get(budgetStateCTRL.getConfig)



export default router
