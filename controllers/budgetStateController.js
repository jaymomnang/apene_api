import budgetState from "../models/budgetStateModel"

const _PAGE = 20;

export default class budgetStateController {
  static async getbudgetStates(req, res) {

    let totalNumItems 
    const budgetStateList = await budgetState.getAllbudgetStates()
    totalNumItems = budgetStateList.length

    let response = {
      budgetState: budgetStateList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  static async getCostCenterByID(req, res) {
    let budgetID = Array.isArray(req.query.budgetID)
      ? req.query.budgetID
      : Array(req.query.budgetID)
    let id = Array.isArray(req.query.id)
      ? req.query.id
      : Array(req.query.id)
    let costcenter = await budgetState.getCostCenterByID(budgetID, id)
    let response = {
      costcenter: costcenter,
    }
    res.json(response)
  }

  static async getbudgetStateByID(req, res) {
    try {
      let id = req.params.id || {}
      let _budgetState = await budgetState.getbudgetStateByID(id)
      if (!_budgetState) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = _budgetState.lastupdated instanceof Date ? "Date" : "other"
      res.json({ budgetState: _budgetState, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchbudgetState(req, res) {
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

    const { budgetStateList, totalNumItems } = await budgetState.getAllbudgetStates({
      filters,
      page,
      _PAGE,
    })

    let response = {
      budgetState: budgetStateList,
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
      return this.searchbudgetState(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await budgetState.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      budgetState: facetedSearchResult.budgetState,
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
    const { poolSize, wtimeout, authInfo } = await budgetState.getConfiguration()
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
