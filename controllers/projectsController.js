import projects from "../models/projectsModel.js"

const _PAGE = 20;

export default class projectsController {
  static async getprojects(req, res) {

    let totalNumItems 
    const projectsList = await projects.getAllprojects()
    totalNumItems = projectsList.length

    let response = {
      projects: projectsList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  static async getprojectById(req, res) {
    try {
      let id = req.params.id || {}
      let project = await projects.getProjectById(id)
      if (!project) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = project.lastupdated instanceof Date ? "Date" : "other"
      res.json({ project, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  static async searchprojects(req, res) {
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
        filters.projectID = req.query.ID
        break
      case "description":
        filters.description = req.query.description
        break
      case "amount":
        filters.amount = req.query.amount
        break
      default:
      // nothing to do
    }

    const { projectsList, totalNumItems } = await projects.getAllprojects({
      filters,
      page,
      _PAGE,
    })

    let response = {
      projects: projectsList,
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
      return this.searchprojects(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await projects.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      projects: facetedSearchResult.projects,
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
    const { poolSize, wtimeout, authInfo } = await projects.getConfiguration()
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
