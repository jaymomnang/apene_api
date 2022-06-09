import COA from "../models/COAModel.js";

const _PAGE = 20;

export default class COAController {
  static async getCOA(req, res) {

    let totalNumItems 
    const COAList = await COA.getAllcoas()
    totalNumItems = COAList.length

    let id = req;

    let response = {
      COA: COAList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  // static async getCOAByCountry(req, res, next) {
  //   let countries = Array.isArray(req.query.countries)
  //     ? req.query.countries
  //     : Array(req.query.countries)
  //   let COAList = await COA.getCOAByCountry(countries)
  //   let response = {
  //     settings: COAList,
  //   }
  //   res.json(response)
  // }

  static async getCOAByID(req, res) {
    try {
      let id = req.params.id || {}
      let _coa = await COA.getCOAByID(id)
      if (!_coa) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = _coa.lastupdated instanceof Date ? "Date" : "other"
      res.json({ COA: _coa, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchCOA(req, res) {
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

    const { COAList, totalNumItems } = await COA.getAllcoas({
      filters,
      page,
      _PAGE,
    })

    let response = {
      COA: COAList,
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
      return this.searchCOA(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await COA.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      COA: facetedSearchResult.COA,
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
    const { poolSize, wtimeout, authInfo } = await COA.getConfiguration()
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
