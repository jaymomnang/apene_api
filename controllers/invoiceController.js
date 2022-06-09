import invoices from "../models/invoiceModel.js"

const _PAGE = 20;

export default class invoicesController {
  static async getInvoices(req, res) {

    let totalNumItems 
    const invoicesList = await invoices.getAllInvoices()
    totalNumItems = invoicesList.length

    let response = {
      invoices: invoicesList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  // static async getinvoicesByCountry(req, res, next) {
  //   let countries = Array.isArray(req.query.countries)
  //     ? req.query.countries
  //     : Array(req.query.countries)
  //   let invoicesList = await invoices.getinvoicesByCountry(countries)
  //   let response = {
  //     settings: invoicesList,
  //   }
  //   res.json(response)
  // }

  static async getinvoiceById(req, res) {
    try {
      let id = req.params.id || {}
      let invoice = await invoices.getInvoiceById(id)
      if (!invoice) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = invoice.lastupdated instanceof Date ? "Date" : "other"
      res.json({ invoice, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchinvoices(req, res) {
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

    const { invoicesList, totalNumItems } = await invoices.getAllInvoices({
      filters,
      page,
      _PAGE,
    })

    let response = {
      invoices: invoicesList,
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
      return this.searchinvoices(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await invoices.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      invoices: facetedSearchResult.invoices,
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
    const { poolSize, wtimeout, authInfo } = await invoices.getConfiguration()
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
