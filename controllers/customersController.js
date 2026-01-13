import customers from "../models/customerModel.js"
import globalOps from "../misc/globalOps.js";

const _PAGE = 20;

export default class customersController {
  static async getCustomers(req, res) {

    let totalNumItems
    const customersList = await customers.getAllCustomers()
    totalNumItems = customersList.length

    let response = {
      customers: customersList,
      page: 0,
      filters: {},
      items_per_page: _PAGE,
      total_items: totalNumItems,
    }
    res.json(response)
  }

  static async getCustomerById(req, res) {
    try {
      let id = req.params.id || {}
      let customer = await customers.getCustomerById(id)
      if (!customer) {
        res.status(404).json({ error: "Not found" })
        return
      }
      let updated_type = customer.lastupdated instanceof Date ? "Date" : "other"
      res.json({ customer: customer, updated_type })
    } catch (e) {
      console.log(`api, ${e}`)
      res.status(500).json({ error: e })
    }
  }

  /// Add new customer
  static async addNewCustomer(req, res) {
    try {
      const { customerID, fullname, email, phoneno1, phoneno2, customerType, refSource, address, city, state, country, postcode, user } = req.body;

      if (!customerID || !fullname || !email || !phoneno1 || !user) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingCustomer = await customers.getCustomerById(customerID);
      if (existingCustomer.length > 0) {
        res.status(400).json({ error: "Customer already exists" });
        return;
      }

      let custID = "";

      const lastCustomer = await customers.getLastCustomer();
      if (lastCustomer && lastCustomer.customerID) {
        custID = globalOps.getNewID(lastCustomer.customerID);
      } else {
        custID = "CST00001";
      }

      let dt = globalOps.currentDateTime();

      const result = await customers.addCustomer(custID, fullname, email, phoneno1, phoneno2, customerType, address, city, state, country, postcode, refSource, "active", dt, user, dt, user);
      res.status(201).json({ message: "Customer account created successfully", customer: result });
    } catch (e) {
      console.error(`Error adding customer account: ${e}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // update existing customer account
  static async updateCustomer(req, res) {
    try {
      const { customerID, email, phoneno1, phoneno2, customerType, address, city, state, country, postcode, refSource, status, user } = req.body;

      if (!customerID || !email || !phoneno1 || !user) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingCustomer = await customers.getCustomerById(customerID);
      if (existingCustomer.length == 0) {
        res.status(400).json({ error: "Customer does not exists" });
        return;
      }

      let dt = globalOps.currentDateTime();

      const result = await customers.updateCustomer(customerID, email, phoneno1, phoneno2, customerType, address, city, state, country, postcode, refSource, status, dt, user);
      res.status(201).json({ message: "Customer account updated successfully", customer: result });
    } catch (e) {
      console.error(`Error saving customer information: ${e}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // update existing customer account
  static async deleteCustomer(req, res) {
    try {
      const { customerID, user, status } = req.body;

      if (!customerID || !user) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const existingCustomer = await customers.getCustomerById(customerID);
      if (existingCustomer.length == 0) {
        res.status(400).json({ error: "Customer does not exists" });
        return;
      }

      let dt = globalOps.currentDateTime();

      const result = await customers.deleteCustomer(customerID, status, user, dt);
      if(status !== "suspended"){
        res.status(201).json({ message: "Customer account activated successfully", customer: result });
      }else{
        res.status(201).json({ message: "Customer account deactivated successfully", customer: result });
      }
      
    } catch (e) {
      console.error(`Error activating/deactivating customer account: ${e}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async searchCustomers(req, res) {
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

    const { customersList, totalNumItems } = await customers.getAllCustomers({
      filters,
      page,
      _PAGE,
    })

    let response = {
      customers: customersList,
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
      return this.searchCustomers(req, res, next)
    }

    const filters = { cast: req.query.cast }

    const facetedSearchResult = await customers.facetedSearch({
      filters,
      page,
      _PAGE,
    })

    let response = {
      customers: facetedSearchResult.customers,
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
    const { poolSize, wtimeout, authInfo } = await customers.getConfiguration()
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
