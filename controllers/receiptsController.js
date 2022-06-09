import receipts from "../models/receiptsModel.js"

const _PAGE = 20;

export default class receiptsController {
  static async getreceipts(req, res) {

    let totalNumItems 
    const receiptsList = await receipts.getAllreceipts()
    totalNumItems = receiptsList.length

    let response = {
      receipts: receiptsList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  static async getreceiptById(req, res) {
    try {
      let id = req.params.id || {}
      let receipt = await receipts.getreceiptById(id)
      if (!receipt) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = receipt.lastupdated instanceof Date ? "Date" : "other"
      res.json({ receipt, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchreceipts(req, res) {
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
        filters.receiptID = req.query.ID
        break
      case "invoiceID":
        filters.invoiceID = req.query.invoiceID
        break
      case "orderNo":
        filters.orderNo = req.query.orderNo
        break
      default:
      // nothing to do
    }

    const { receiptsList, totalNumItems } = await receipts.getAllreceipts({
      filters,
      page,
      _PAGE,
    })

    let response = {
      receipts: receiptsList,
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
      return this.searchreceipts(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await receipts.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      receipts: facetedSearchResult.receipts,
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
    const { poolSize, wtimeout, authInfo } = await receipts.getConfiguration()
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
