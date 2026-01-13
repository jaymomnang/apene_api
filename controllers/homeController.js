import home from "../models/homeModel.js"
import globalOps from "../misc/globalOps.js";

const _PAGE = 260;

export default class homeController {
  static async handShake(req, res) {
    const msg = await home.executeHandshake()
    let response = {message: msg}
    res.json(response)
  }

  /// Get the states of a particular country
  static async getStatesbyCountryCode(req, res) {
    try {
      let country = req.params.country || {}
      let states = await home.getStatesByCountry(country)
      if (!states) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = states.lastupdated instanceof Date ? "Date" : "other"
      res.json({ states: states, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  /// Get all countries from the db
  static async getAllCountries(req, res) {
    try {
      let countries = await home.getAllCountries()
      if (!countries) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = countries.lastupdated instanceof Date ? "Date" : "other"
      res.json({ countries: countries, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  /// Get a particular country by name
  static async getCountrybyName(req, res) {
    try {
      let country = req.params.country || {}
      let countryData = await home.getCountrybyName(country)
      if (!countryData) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = countryData.lastupdated instanceof Date ? "Date" : "other"
      res.json({ country: countryData, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  /// Get a particular country by country code
  static async getCountrybyCode(req, res) {
    try {
      let code = req.params.country || {}
      let countryData = await home.getCountrybyCode(code)
      if (!countryData) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = countryData.lastupdated instanceof Date ? "Date" : "other"
      res.json({ country: countryData, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  
  static async getConfig(req, res) {
    const { poolSize, wtimeout, authInfo } = await home.getConfiguration()
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
