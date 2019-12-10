/*global process*/
import globalOps from "../misc/globalOps";

let invoices;

export default class invoiceModel {
  static async injectDB(conn) {
    if (invoices) {
      return;
    }
    try {
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
   * @param {string} dateUpdated - The date on which the Invoice was last updated.
   * @param {Object} updateBy - The user that last updated the invoice.
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
    shipTo,
    dateUpdated,
    updateBy
  ) {
    try {
      // TODO: Create/Update invoices
      // Construct the Invoice document to be inserted.
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
        dateUpdated: dateUpdated,
        updateBy: updateBy,
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
    Todo: retrieve all invoices from the database using slow loading. Limit to first 20
    */
    try {
      // Return the 20 most recent invoices.
      const pipeline = [
        {
          $sort: { invoiceID: -1 }
        },
        {
          $limit: 20
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //invoices.readConcern

      const aggregateResult = await invoices.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve invoices: ${e}`);
      return { error: e };
    }
  }
}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */
