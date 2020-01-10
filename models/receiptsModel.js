/*global process*/
import globalOps from "../misc/globalOps";

let receipts;

export default class receiptModel {
  static async injectDB(conn) {
    if (receipts) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      receipts = await conn.db(process.env.NS).collection("receipts");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in receiptModel: ${e}`
      );
    }
  }

  /**
   * Inserts an receipt into the `receipts` collection, with the following fields:

   * @param {string} invoiceID - The _id of the invoice for which the receipt is created.
   * @param {string} receiptID - The _id of the receipt in the `receipts` collection.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Number} receiptAmount - The total amount of the receipt.
   * @param {Number} VAT - The VAT/tax on the receipt.
   * @param {Number} discount - The discount amount on the receipt.
   * @param {string} date - The date on which the receipt was posted.
   * @param {string} orderNo - The purchase order number (if any) for which the receipt is issued.
   * @param {Object} receiptDetails - Details of items, quantity and prices on the receipt.
   * @param {Object} customer - The customer to whom the receipt is issued.
   * @param {Object} shipTo - The shipping details.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addreceipt(
    receiptID,
    invoiceID,
    user,
    receiptAmount,
    VAT,
    discount,
    date,
    orderNo,
    receiptDetails,
    customer,
    shipTo
  ) {
    try {

      let dt = globalOps.currentDateTime();
      // TODO: Create/Update receipts
      // Construct the receipt document to be inserted.
      const receiptDoc = {
        receiptID: receiptID,
        invoiceID: invoiceID,
        user: user,
        receiptAmount: receiptAmount,
        VAT: VAT,
        discount: discount,
        date: date,
        orderNo: orderNo,
        receiptDetails: receiptDetails,
        customer: customer,
        shipTo: shipTo,
        dateCreated: dt,
        dateUpdated: dt,
        createdBy: user,
        updateBy: user,
        status: "OPEN"
      };

      return await receipts.insertOne(receiptDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post receipt: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the receipt in the receipt collection.
   * @param {string} invoiceID - The _id of the invoice for which the receipt is created.
   * @param {string} receiptID - The _id of the receipt in the `receipts` collection.
   * @param {Number} receiptAmount - The total amount of the receipt.
   * @param {Number} VAT - The VAT/tax on the receipt.
   * @param {Number} discount - The discount amount on the receipt.
   * @param {string} date - The date on which the receipt was posted.
   * @param {string} orderNo - The purchase order number (if any) for which the receipt is issued.
   * @param {Object} receiptDetails - Details of items, quantity and prices on the receipt.
   * @param {Object} customer - The customer to whom the receipt is issued.
   * @param {Object} shipTo - The shipping details.
   * @param {Object} user - The user that last updated the receipt.
   * @param {string} status - The status of the receipt: OPEN, CLOSED, VOID.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatereceipt(
    receiptID,
    invoiceID,
    receiptAmount,
    VAT,
    discount,
    date,
    orderNo,
    receiptDetails,
    customer,
    shipTo,
    user
  ) {
    try {
      // TODO: Create/Update receipts
      // Use the receiptId and status to select the proper receipt, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await receipts.updateOne(
        { receiptID: receiptID, invoiceID: invoiceID, status: "OPEN" },
        {
          $set: {
            receiptAmount: receiptAmount,
            VAT: VAT,
            discount: discount,
            date: date,
            orderNo: orderNo,
            receiptDetails: receiptDetails,
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
      console.error(`Unable to update receipt: ${e}`);
      return { error: e };
    }
  }

  //void a specific receipt
  static async deletereceipt(receiptID, invoiceID) {
    /**
    Ticket: void receipt. Only open receipts can be voided.
    */

    try {
      // TODO Ticket: void receipt
      const deleteResponse = await receipts.updateOne(
        { receiptID: receiptID, invoiceID: invoiceID, status: "OPEN" },
        { $set: { status: "VOID" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to void receipt: ${e}`);
      return { error: e };
    }
  }


  //retrieve all receipts
  static async getAllreceipts() {
    /**
    Todo: retrieve all receipts from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { invoiceID: -1, receiptID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //receipts.readConcern

      const aggregateResult = await receipts.aggregate(pipeline, {
        readConcern
      });
      
      return await aggregateResult.toArray();
      
    } catch (e) {
      console.error(`Unable to retrieve receipts: ${e}`);
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
