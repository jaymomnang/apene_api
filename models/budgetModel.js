/*global process*/
import globalOps from "../misc/globalOps.js";

let budgets;
let _ns;

export default class budgetModel {
  static async injectDB(conn) {
    if (budgets) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
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
      console.error(`Unable to post to budgets: ${e}`);
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
      console.error(`Unable to update budgets: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific budget
  static async deletebudget(AccountID, budgetID) {
    /**
    Ticket: deactivate budget. Only active budget can be voided.
    */

    try {
      // TODO Ticket: deactivate budget
      const deleteResponse = await budgets.updateOne(
        { AccountID: AccountID, budgetID: budgetID, isActive: true},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified budget: ${e}`);
      return { error: e };
    }
  }

  //retrieve all budgets
  static async getAllbudgets() {
    /**
    Todo: retrieve all budgets from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { AccountID: -1, budgetID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //budgets.readConcern

      const aggregateResult = await budgets.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
      
    } catch (e) {
      console.error(`Unable to retrieve budgets: ${e}`);
      return { error: e };
    }
  }

  //retrieve a specific budget
  static async getBudgetByID(Id) {
    try {
      const pipeline = [
        {
          $match: { budgetID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //budgets.readConcern

      const aggregateResult = await budgets.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve budgets: ${e}`);
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
    const { poolSize, wtimeout } = budgets.s.db.serverConfig.s.options
    let response = {
      poolSize,
      wtimeout,
      authInfo,
    }
    return response
  }

}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */
