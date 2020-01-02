/*global process*/
import globalOps from "../misc/globalOps";

let budgets;

export default class budgetModel {
  static async injectDB(conn) {
    if (budgets) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      budgets = await conn.db(process.env.NS).collection("budgets");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in budgetModel: ${e}`
      );
    }
  }

  /**
   * Inserts an budget into the `budget` collection, with the following fields:

   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} budgetID - The budget ID.
   * @param {string} name - The name of the budget.
   * @param {string} description - Description of the budget.
   * @param {Object} user - the user that created/updated the account.
   * @param {Boolean} isActive - Switch to turn on/off an budget.
   * @param {Object} user - the user that created/updated the budget.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addbudget(
    AccountID,
    budgetID,
    name,
    description,
    isActive,
    user
  ) {
    try {

      let dateOps = globalOps.currentDateTime();

      // TODO: Create/Update budgets
      // Construct the budget document to be inserted.
      const budgetDoc = {
        AccountID: AccountID,
        budgetID: budgetID,
        name: name,
        description: description,
        isActive: isActive,
        dateCreated: dateOps,
        createdBy: user,
        dateUpdated: dateOps,
        updateBy: user
      };

      return await budgets.insertOne(budgetDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post to charts of accounts: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the budget in the budget collection.
   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} budgetID - The budgetState ID.
   * @param {string} name - The name of the account.
   * @param {string} description - Description of the account.
   * @param {Boolean} isActive - Switch to turn on/off an account.
   * @param {Object} user - the user that updated the account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatebudget(
    AccountID,
    budgetID,
    name,
    description,
    isActive,
    user
  ) {
    try {
      // TODO: Create/Update budgets
      // Use the AccountID to select the proper budget, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await budgets.updateOne(
        { AccountID: AccountID, budgetID: budgetID },
        {
          $set: {
            description: description,
            name: name,
            isActive: isActive,
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update charts of accounts: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific account
  static async deletebudget(AccountID, budgetID) {
    /**
    Ticket: deactivate budget. Only active accounts can be voided.
    */

    try {
      // TODO Ticket: deactivate budget
      const deleteResponse = await budgets.updateOne(
        { AccountID: AccountID, budgetID: budgetID, isActive: true},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified account: ${e}`);
      return { error: e };
    }
  }


  //retrieve all budgets
  static async getAllbudgets() {
    /**
    Todo: retrieve all budgets from the database using slow loading. Limit to first 20
    */
    try {
      // Return the 20 most recent budgets.
      const pipeline = [
        {
          $sort: { AccountID: -1, budgetID: -1 }
        },
        {
          $limit: 20
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //budgets.readConcern

      const aggregateResult = await budgets.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve charts of accounts: ${e}`);
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
