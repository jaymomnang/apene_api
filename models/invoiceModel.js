/*global process*/
import globalOps from "../misc/globalOps";

let invoices;
let _ns;

export default class invoiceModel {
  static async injectDB(conn) {
    if (invoices) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      invoices = await conn.db(process.env.NS).collection("Invoices");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in invoiceModel: ${e}`
      );
    }
  }

  /**
   * Inserts an Invoice into the `invoices` collection, with the following fields:

   * @param {string} invoiceID - The _id of the invoice in the `invoices` collection.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Number} invoiceAmount - The total amount of the Invoice.
   * @param {Number} VAT - The VAT/tax on the Invoice.
   * @param {Number} discount - The discount amount on the Invoice.
   * @param {string} date - The date on which the Invoice was posted.
   * @param {string} orderNo - The purchase order number (if any) for which the invoice is issued.
   * @param {Object} invoiceDetails - Details of items, quantity and prices on the invoice.
   * @param {Object} customer - The customer to whom the invoice is issued.
   * @param {Object} shipTo - The shipping details.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addInvoice(
    invoiceID,
    user,
    invoiceAmount,
    VAT,
    discount,
    date,
    orderNo,
    invoiceDetails,
    customer,
    shipTo
  ) {
    try {
      // TODO: Create/Update invoices
      // Construct the Invoice document to be inserted.
      let date_upd = globalOps.currentDateTime();

      const InvoiceDoc = {
        invoiceID: invoiceID,
        user: user,
        invoiceAmount: invoiceAmount,
        VAT: VAT,
        discount: discount,
        date: date,
        orderNo: orderNo,
        invoiceDetails: invoiceDetails,
        customer: customer,
        shipTo: shipTo,
        dateCreated: date_upd,
        createdBy: user,
        dateUpdated: date_upd,
        updateBy: user,
        status: "OPEN"
      };

      return await invoices.insertOne(InvoiceDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post Invoice: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the Invoice in the Invoice collection.
   * @param {string} invoiceID - The _id of the invoice in the `invoices` collection.
   * @param {Number} invoiceAmount - The total amount of the Invoice.
   * @param {Number} VAT - The VAT/tax on the Invoice.
   * @param {Number} discount - The discount amount on the Invoice.
   * @param {string} date - The date on which the Invoice was posted.
   * @param {string} orderNo - The purchase order number (if any) for which the invoice is issued.
   * @param {Object} invoiceDetails - Details of items, quantity and prices on the invoice.
   * @param {Object} customer - The customer to whom the invoice is issued.
   * @param {Object} shipTo - The shipping details.
   * @param {Object} user - The user that last updated the invoice.
   * @param {string} status - The status of the invoice: OPEN, CLOSED, VOID.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateInvoice(
    invoiceID,
    invoiceAmount,
    VAT,
    discount,
    date,
    orderNo,
    invoiceDetails,
    customer,
    shipTo,
    user
  ) {
    try {
      // TODO: Create/Update invoices
      // Use the InvoiceId and status to select the proper Invoice, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await invoices.updateOne(
        { invoiceID: invoiceID, status: "OPEN" },
        {
          $set: {
            invoiceAmount: invoiceAmount,
            VAT: VAT,
            discount: discount,
            date: date,
            orderNo: orderNo,
            invoiceDetails: invoiceDetails,
            customer: customer,
            shipTo: shipTo,
            dateUpdated: date_upd,
            updateBy: user,
            status: status
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update Invoice: ${e}`);
      return { error: e };
    }
  }

  //void a specific invoice
  static async deleteInvoice(invoiceID) {
    /**
    Ticket: void invoice. Only open invoices can be voided.
    */

    try {
      // TODO Ticket: void invoice
      const deleteResponse = await invoices.updateOne(
        { invoiceID: invoiceID, status: "OPEN" },
        { $set: { status: "VOID" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to void Invoice: ${e}`);
      return { error: e };
    }
  }


  //retrieve all invoices
  static async getAllInvoices() {
    /**
    Todo: retrieve all invoices from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { invoiceID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //invoices.readConcern

      const aggregateResult = await invoices.aggregate(pipeline, {
        readConcern
      });

      if (aggregateResult.length > 1){
        return await aggregateResult.toArray();
      }
      return new Array(aggregateResult, 1)

    } catch (e) {
      console.error(`Unable to retrieve invoices: ${e}`);
      return { error: e };
    }
  }

  //retrieve an invoice using the transaction Id
  static async getInvoiceById(Id) {   
    try {
      const pipeline = [
        {
          $match: { invoiceID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //invoices.readConcern
      const aggregateResult = await invoices.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve invoice: ${e}`);
      return { error: e };
    }
  }

  
  /**
   * Retrieves the connection pool size, write concern and user roles on the
   * current client.
   * @returns {Promise<ConfigurationResult>} An object with configuration details.
   */
  static async getConfiguration() {
    const roleInfo = await _ns.command({ connectionStatus: 1 })
    const authInfo = roleInfo.authInfo.authenticatedUserRoles[0]
    const { poolSize, wtimeout } = invoices.s.db.serverConfig.s.options
    let response = {
      poolSize,
      wtimeout,
      authInfo,
    }
    return response
  }


/**
   *
   * @param {Object} filters - The search parameter to use in the query. Comes
   * in the form of `{cast: { $in: [...castMembers]}}`
   * @param {number} page - The page of movies to retrieve.
   * @param {number} moviesPerPage - The number of movies to display per page.
   * @returns {FacetedSearchReturn} FacetedSearchReturn
   */
  static async facetedSearch({
    filters = null,
    page = 0,
    moviesPerPage = 20,
  } = {}) {
    if (!filters || !filters.dates) {
      throw new Error("Must specify dates to filter by.")
    }
    const matchStage = { $match: filters }
    const sortStage = { $sort: { "invoiceID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {        
        customer: [
          {
            $bucket: {
              groupBy: "$customer.name",
              boundaries: [0, 50, 70, 90, 100],
              default: "other",
              output: {
                count: { $sum: 1 },
              },
            },
          },
        ]
      },
    }

    /**
    Ticket: Faceted Search

    Please append the skipStage, limitStage, and facetStage to the queryPipeline
    (in that order). You can accomplish this by adding the stages directly to
    the queryPipeline.

    The queryPipeline is a Javascript array, so you can use push() or concat()
    to complete this task, but you might have to do something about `const`.
    */

    const queryPipeline = [
      matchStage,
      sortStage,
      // TODO Ticket: Faceted Search
      // Add the stages to queryPipeline in the correct order.
      skipStage,
      limitStage,
      facetStage
    ]

    try {
      const results = await (await invoices.aggregate(queryPipeline)).next()
      const count = await (await invoices.aggregate(countingPipeline)).next()
      return {
        ...results,
        ...count,
      }
    } catch (e) {
      return { error: "Results too large, be more restrictive in filter" }
    }
    
  }
}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */