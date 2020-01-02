/*global process*/
import globalOps from "../misc/globalOps";

let budgetStates;

export default class budgetStateModel {
  static async injectDB(conn) {
    if (budgetStates) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      budgetStates = await conn.db(process.env.NS).collection("budgetStates");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in budgetStateModel: ${e}`
      );
    }
  }

  /**
   * Inserts an budgetState into the `budgetState` collection, with the following fields:

   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} budgetID - The budget ID.
   * @param {string} budgetStateID - The budgetState ID.
   * @param {Object} costcenter - The cost center/department responsible for the cost.
   * @param {string} name - The name of the budgetState.
   * @param {string} description - Description of the budgetState.
   * @param {Object} user - the user that created/updated the account.
   * @param {Boolean} isActive - Switch to turn on/off an budgetState.
   * @param {Object} user - the user that created/updated the budgetState.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addbudgetState(
    AccountID,
    budgetID,
    budgetStateID,
    costcenter,
    name,
    description,
    isActive,
    user
  ) {
    try {
      let dateOps = globalOps.currentDateTime();

      // TODO: Create/Update budgetStates
      // Construct the budgetState document to be inserted.
      const budgetStateDoc = {
        AccountID: AccountID,
        budgetID: budgetID,
        budgetStateID: budgetStateID,
        name: name,
        description: description,
        costcenter: costcenter,
        isActive: isActive,
        dateCreated: dateOps,
        createdBy: user,
        dateUpdated: dateOps,
        updateBy: user
      };

      return await budgetStates.insertOne(budgetStateDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post to budgetStates: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the budgetState in the budgetState collection.
   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} budgetID - The budget ID.
   * @param {string} budgetStateID - The budgetState ID.
   * @param {Object} costcenter - The cost center/department responsible for the cost.
   * @param {string} name - The name of the account.
   * @param {string} description - Description of the account.
   * @param {Boolean} isActive - Switch to turn on/off an account.
   * @param {Object} user - the user that updated the account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatebudgetState(AccountID, budgetID, budgetStateID, costcenter, name, description, isActive, user) {
    try {
      // TODO: Create/Update budgetStates
      // Use the AccountID, budgetID & budgetStateID to select the proper budgetState, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await budgetStates.updateOne(
        { AccountID: AccountID, budgetID: budgetID, budgetStateID: budgetStateID },
        {
          $set: {
            description: description,
            name: name,
            costcenter: costcenter,
            isActive: isActive,
            dateUpdated: date_upd,
            updateBy: user
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update budgetStates: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific budgetState
  static async deletebudgetState(AccountID, budgetID, budgetStateID) {
    /**
    Ticket: deactivate budgetState. Only active budgetStates can be voided.
    */

    try {
      // TODO Ticket: deactivate budgetState
      const deleteResponse = await budgetStates.updateOne(
        { AccountID: AccountID, budgetID: budgetID, budgetStateID: budgetStateID, isActive: true },
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified budgetState: ${e}`);
      return { error: e };
    }
  }

  //retrieve all budgetStates
  static async getAllbudgetStates() {
    /**
    Todo: retrieve all budgetStates from the database using slow loading. Limit to first 20
    */
    try {
      // Return the 20 most recent budgetStates.
      const pipeline = [
        {
          $sort: { AccountID: -1, budgetID: -1, budgetStateID: -1 }
        },
        {
          $limit: 20
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //budgetStates.readConcern

      const aggregateResult = await budgetStates.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve budgetStates: ${e}`);
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
