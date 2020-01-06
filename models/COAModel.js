/*global process*/
import globalOps from "../misc/globalOps";

let coas;
let _ns;

export default class coaModel {
  static async injectDB(conn) {
    if (coas) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      coas = await conn.db(process.env.NS).collection("COA");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in coaModel: ${e}`
      );
    }
  }

  /**
   * Inserts an coa into the `COA` collection, with the following fields:

   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} name - The name of the account.
   * @param {string} description - Description of the account.
   * @param {Boolean} isActive - Switch to turn on/off an account.
   * @param {Object} user - the user that created/updated the account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addcoa(
    AccountID,
    name,
    description,
    isActive,
    user
  ) {
    try {

      let dateOps = globalOps.currentDateTime();

      // TODO: Create/Update coas
      // Construct the coa document to be inserted.
      const coaDoc = {
        AccountID: AccountID,        
        name: name,
        description: description,
        isActive: isActive,
        dateCreated: dateOps,
        createdBy: user,
        dateUpdated: dateOps,
        updateBy: user
      };

      return await coas.insertOne(coaDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post to charts of accounts: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the coa in the coa collection.
   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} name - The name of the account.
   * @param {string} description - Description of the account.
   * @param {Boolean} isActive - Switch to turn on/off an account.
   * @param {Object} user - the user that updated the account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updatecoa(
    AccountID,
    name,
    description,
    isActive,
    user
  ) {
    try {
      // TODO: Create/Update coas
      // Use the AccountID to select the proper coa, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await coas.updateOne(
        { AccountID: AccountID },
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
  static async deletecoa(AccountID) {
    /**
    Ticket: deactivate coa. Only active accounts can be voided.
    */

    try {
      // TODO Ticket: deactivate coa
      const deleteResponse = await coas.updateOne(
        { AccountID: AccountID, isActive: true},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified account: ${e}`);
      return { error: e };
    }
  }


  //retrieve all coas
  static async getAllcoas() {
    /**
    Todo: retrieve all coas from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { AccountID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //coas.readConcern

      const aggregateResult = await coas.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve charts of accounts: ${e}`);
      return { error: e };
    }
  }

  //retrieve a specific account from the charts db
  static async getCOAByID(Id) {
    try {
      const pipeline = [
        {
          $match: { AccountID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //coas.readConcern

      const aggregateResult = await coas.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve charts of accounts: ${e}`);
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
    const { poolSize, wtimeout } = coas.s.db.serverConfig.s.options
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
