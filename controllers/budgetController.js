import budget from "../models/budgetModel"

const _PAGE = 20;

export default class budgetController {
  static async getBudgets(req, res) {
    
    let totalNumItems 
    const budgetList = await budget.getAllbudgets()
    totalNumItems = budgetList.length

    let response = {
      budget: budgetList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  // static async getbudgetByCountry(req, res, next) {
  //   let countries = Array.isArray(req.query.countries)
  //     ? req.query.countries
  //     : Array(req.query.countries)
  //   let budgetList = await budget.getbudgetByCountry(countries)
  //   let response = {
  //     settings: budgetList,
  //   }
  //   res.json(response)
  // }

  static async getbudgetByID(req, res) {
    try {
      let id = req.params.id || {}
      let _budget = await budget.getBudgetByID(id)
      if (!_budget) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = _budget.lastupdated instanceof Date ? "Date" : "other"
      res.json({ budget: _budget, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchbudget(req, res) {
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

    const { budgetList, totalNumItems } = await budget.getAllbudgets({
      filters,
      page,
      _PAGE,
    })

    let response = {
      budget: budgetList,
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
      return this.searchbudget(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await budget.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      budget: facetedSearchResult.budget,
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
    const { poolSize, wtimeout, authInfo } = await budget.getConfiguration()
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
