/*global process*/
import globalOps from "../misc/globalOps";

let cashbook;

export default class cashbookModel {
  static async injectDB(conn) {
    if (cashbook) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      cashbook = await conn.db(process.env.NS).collection("cashbook");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in cashbookModel: ${e}`
      );
    }
  }

  /**
   * Inserts a cashbook transaction into the `cashbook` collection, with the following fields:

   * @param {string} transactionID - The transaction ID.
   * @param {string} bank - The bank for which the transactions occured.
   * @param {string} transactionDate - The date of the transaction.
   * @param {Number} totalAmount - The total amount on the cashbook transaction.
   * @param {string} description - Description of the cashbook.
   * @param {Object} details - the user that created/updated the account.
   * @param {Boolean} isActive - Switch to turn on/off an cashbook.
   * @param {Object} user - the user that created/updated the cashbook.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addcashbook(
    transactionID,
    bank,
    transactionDate,
    totalAmount,
    details,
    description,
    isActive,
    user
  ) {
    try {
      let dateOps = globalOps.currentDateTime();

      // TODO: Create/Update cashbooks
      // Construct the cashbook document to be inserted.
      const cashbookDoc = {
        transactionID: transactionID,
        bank: bank,
        transactionDate: transactionDate,
        totalAmount: totalAmount,
        description: description,
        details: details,
        isActive: isActive,
        status: "OPEN",
        dateCreated: dateOps,
        createdBy: user,
        dateUpdated: dateOps,
        updateBy: user
      };

      return await cashbook.insertOne(cashbookDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post to cashbook: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the cashbook in the cashbook collection.
   * @param {string} transactionID - The transaction ID.
   * @param {Number} totalAmount - The total amount on the cashbook transaction.
   * @param {string} description - Description of the cashbook.
   * @param {Object} details - the user that created/updated the account.
   * @param {Boolean} isActive - Switch to turn on/off the cashbook transaction.
   * @param {string} status - state of the cashbook transaction.
   * @param {Object} user - the user that created/updated the cashbook.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatecashbook(transactionID, totalAmount, details, description, isActive, status, user) {
    try {
      // TODO: Create/Update cashbooks
      // Use the AccountID to select the proper cashbook, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await cashbook.updateOne(
        { transactionID: transactionID },
        {
          $set: {
            description: description,
            details: details,
            totalAmount: totalAmount,
            isActive: isActive,
            status: status,
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update cashbook transaction: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific transaction
  static async deletecashbook(transactionID) {
    /**
    Ticket: deactivate cashbook. Only active transactions can be voided.
    */

    try {
      // TODO Ticket: deactivate cashbook transaction
      const deleteResponse = await cashbook.updateOne(
        { transactionID: transactionID, isActive: true, status: "OPEN" },
        { $set: { isActive: false, status: "VOIDED" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified cashbook transaction: ${e}`);
      return { error: e };
    }
  }

  //retrieve cashbooks transactions
  static async getAllcashbooks() {
    /**
    Todo: retrieve cashbooks transactions from the database using slow loading. Limit to first 20
    */
    try {
      // Return the 20 most recent cashbooks.
      const pipeline = [
        {
          $sort: { transactionID: -1, transactionDate: -1 }
        },
        {
          $limit: 20
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //cashbooks.readConcern

      const aggregateResult = await cashbook.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve cashbook transactions: ${e}`);
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
