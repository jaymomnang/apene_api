import { Router } from "express"
import appSettingsCTRL from "../controllers/AppSettingController"
import usersCTRL from "../controllers/userController"

const router = new Router()

// routes for app settings
router.route("/settings/").get(appSettingsCTRL.getAppSettings)
router.route("/settings/search").get(appSettingsCTRL.searchAppSettings)
router.route("/settings/facet-search").get(appSettingsCTRL.facetedSearch)
router.route("/settings/id/:id").get(appSettingsCTRL.getAppSettingById)
router.route("/settings/config-options").get(appSettingsCTRL.getConfig)

// routes for app users
router.route("/people/").get(usersCTRL.getusers)
router.route("/people/search").get(usersCTRL.searchusers)
router.route("/people/facet-search").get(usersCTRL.facetedSearch)
router.route("/people/id/:email").get(usersCTRL.getuserById)
router.route("/people/config-options").get(usersCTRL.getConfig)

export default router
