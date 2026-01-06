import appSettings from "../models/AppSettingModel.js"

const _PAGE = 20;

export default class appSettingsController {
  static async getAppSettings(req, res) {

    let totalNumItems
    const appSettingsList = await appSettings.getAllsettings()
    totalNumItems = appSettingsList.length

    let response = {
      appSettings: appSettingsList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  static async getAppSettingById(req, res) {
    try {
      let id = req.params.id || {}
      let appSetting = await appSettings.getAppSettingByID(id)
      if (!appSetting) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = appSetting.lastupdated instanceof Date ? "Date" : "other"
      res.json({ appSetting, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async addNewSetting(req, res) {
    try {
      const { key, name, value, valueDescription, isValueRange, startingRange, endingRange, user } = req.body;

      if (!key || !name || !value || !valueDescription || !isValueRange) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingSetting = await appSettings.getSettingById(key);
      if (existingSetting.length > 0) {
        res.status(400).json({ error: "Setting already exists" });
        return;
      }

      key = await this.getNewKey();
      let dt = globalOps.currentDateTime();

      const u = {
        key: key,
        name: name,
        value: value,
        valueDescription: valueDescription,
        isValueRange: isValueRange,
        startingRange: startingRange,
        endingRange: endingRange,
        status: "active",
        createdBy: user,
        updatedBy: user,
        dateCreated: dt,
        dateUpdated: dt
      };

      const result = await appSettings.addSetting(u);
      res.status(201).json({ message: "Setting created successfully", setting: result });
    } catch (e) {
      console.error(`Error during signup: ${e}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // get the last key from the settings collection and increment by 1
  static async getNewKey() {
    const lastSetting = await appSettings.getLastSetting();
    if (lastSetting && lastSetting.key) {
      return globalOps.getNewID(lastSetting.key);
    }
    return 1;
  }

  static async searchAppSettings(req, res) {
    let page
    try {
      page = req.query.page ? parseInt(req.query.page, 10) : 0
    } catch (e) {
      console.error(`Got bad value for page:, ${e}`)
      page = 0
    }
    let searchType
    try {
      searchType = Object.keys(req.query)[0]
    } catch (e) {
      console.error(`No search keys specified: ${e}`)
    }

    let filters = {}

    switch (searchType) {
      case "ID":
        filters.ID = req.query.ID
        break
      case "description":
        filters.description = req.query.description
        break
      case "name":
        filters.name = req.query.name
        break
      default:
      // nothing to do
    }

    const { appSettingsList, totalNumItems } = await appSettings.getAllSettings({
      filters,
      page,
      _PAGE,
    })

    let response = {
      appSettings: appSettingsList,
      page: page,
      filters,
      items_per_page: _PAGE,
      total_results: totalNumItems,
    }

    res.json(response)
  }

  static async facetedSearch(req, res, next) {

    let page
    try {
      page = req.query.page ? parseInt(req.query.page, 10) : 0
    } catch (e) {
      console.error(`Got bad value for page, defaulting to 0: ${e}`)
      page = 0
    }

    if (!req.query.cast) {
      return this.searchAppSettings(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await appSettings.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      appSettings: facetedSearchResult.appSettings,
      facets: {
        runtime: facetedSearchResult.runtime,
        rating: facetedSearchResult.rating,
      },
      page: page,
      filters,
      items_per_page: _PAGE,
      total_results: facetedSearchResult.count,
    }

    res.json(response)
  }

  static async getConfig(req, res) {
    const { poolSize, wtimeout, authInfo } = await appSettings.getConfiguration()
    try {
      let response = {
        pool_size: poolSize,
        wtimeout,
        ...authInfo,
      }
      res.json(response)
    } catch (e) {
      res.status(500).json({ error: e })
    }
  }
}
