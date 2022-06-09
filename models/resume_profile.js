/*global process*/
import globalOps from "../misc/globalOps.js";

let resume_profile;
let _ns;

export default class resume_profileModel {
  static async injectDB(conn) {
    if (resume_profile) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      resume_profile = await conn.db(process.env.NS).collection("resume_profile");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in resume_profileModel: ${e}`
      );
    }
  }

  /**
   * Inserts an resume_profile into the `resume_profile` collection, with the following fields:

   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} resume_profileID - The resume_profile ID.
   * @param {string} name - The name of the resume_profile.
   * @param {string} description - Description of the resume_profile.
   * @param {Object} user - the user that created/updated the account.
   * @param {Boolean} isActive - Switch to turn on/off an resume_profile.
   * @param {Object} user - the user that created/updated the resume_profile.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addresume_profile(
    AccountID,
    resume_profileID,
    name,
    description,
    isActive,
    user
  ) {
    try {

      let dateOps = globalOps.currentDateTime();

      // TODO: Create/Update resume_profile
      // Construct the resume_profile document to be inserted.
      const resume_profileDoc = {
        AccountID: AccountID,
        resume_profileID: resume_profileID,
        name: name,
        description: description,
        isActive: isActive,
        dateCreated: dateOps,
        createdBy: user,
        dateUpdated: dateOps,
        updateBy: user
      };

      return await resume_profile.insertOne(resume_profileDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post to resume_profile: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the resume_profile in the resume_profile collection.
   * @param {string} AccountID - The account ID in the chart of accounts.
   * @param {string} resume_profileID - The resume_profiletate ID.
   * @param {string} name - The name of the account.
   * @param {string} description - Description of the account.
   * @param {Boolean} isActive - Switch to turn on/off an account.
   * @param {Object} user - the user that updated the account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateresume_profile(
    AccountID,
    resume_profileID,
    name,
    description,
    isActive,
    user
  ) {
    try {
      // TODO: Create/Update resume_profile
      // Use the AccountID to select the proper resume_profile, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await resume_profile.updateOne(
        { AccountID: AccountID, resume_profileID: resume_profileID },
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
      console.error(`Unable to update resume_profile: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific resume_profile
  static async deleteresume_profile(AccountID, resume_profileID) {
    /**
    Ticket: deactivate resume_profile. Only active resume_profile can be voided.
    */

    try {
      // TODO Ticket: deactivate resume_profile
      const deleteResponse = await resume_profile.updateOne(
        { AccountID: AccountID, resume_profileID: resume_profileID, isActive: true},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified resume_profile: ${e}`);
      return { error: e };
    }
  }

  //retrieve all resume_profile
  static async getAllresume_profile() {
    /**
    Todo: retrieve all resume_profile from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { AccountID: -1, resume_profileID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //resume_profile.readConcern

      const aggregateResult = await resume_profile.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
      
    } catch (e) {
      console.error(`Unable to retrieve resume_profile: ${e}`);
      return { error: e };
    }
  }

  //retrieve a specific resume_profile
  static async getresume_profileByID(Id) {
    try {
      const pipeline = [
        {
          $match: { resume_profileID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //resume_profile.readConcern

      const aggregateResult = await resume_profile.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve resume_profile: ${e}`);
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
    const { poolSize, wtimeout } = resume_profile.s.db.serverConfig.s.options
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
