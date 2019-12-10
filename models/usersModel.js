
/*global process*/
import globalOps from "..globalOps";

let users;

export default class userModel {
  static async injectDB(conn) {
    if (users) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      users = await conn.db(process.env.NS).collection("users");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in userModel: ${e}`
      );
    }
  }

  /**
   * Inserts a user account into the `users` collection, with the following fields:
   * @param {string} email - The email of the user in the `users` collection.
   * @param {string} firstname - The first name of the user.
   * @param {string} lastname - The last name of the user.
   * @param {string} pwd - The users's authentication pwd.
   * @param {string} sl - The user's authentication key. 
   * @param {string} dateCreated - Date user account was created.
   * @param {Boolean} isActive - A switch to indicate if user account has been activated.
   * @param {string} lastLoginDate - The date the user logged in last.
   * @param {Object} status - The status of the user account.
   * @param {Object} roles - The roles and permission applied to the user account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async adduser(
    email,
    firstname,
    lastname,
    pwd,
    sl,
    dateCreated,
    isActive,
    lastLoginDate,
    status,
    roles
  ) {
    try {
      // TODO: Create user account
      // Construct the user document to be inserted.
      const userDoc = {
        email: email,
        firstname: firstname,
        lastname: lastname,
        pwd: pwd,
        sl: sl,
        dateCreated: dateCreated,
        isActive: isActive,
        lastLoginDate: lastLoginDate,
        status: status,
        roles: roles
      };

      return await users.insertOne(userDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to create user account: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates a user account in the user collection.
   * @param {string} email - The email of the user in the `users` collection.
   * @param {string} pwd - The users's authentication pwd.
   * @param {Boolean} isActive - A switch to indicate if user account has been activated.
   * @param {Object} status - The status of the user account.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateuser(
    email,
    pwd,
    isActive,
    status
  ) {
    try {
      // TODO: Update users
      // Use the email to select the proper user, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await users.updateOne(
        { userID: email, pwd: pwd },
        {
          $set: {
            status: status,
            isActive: isActive,
            lastLoginDate: date_upd
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update user account: ${e}`);
      return { error: e };
    }
  }

  //suspend a specific user account
  static async suspendUser(email) {
    /**
    Ticket: suspend user account. 
    */

    try {
      // TODO Ticket: suspend a user
      const deleteResponse = await users.updateOne(
        { email: email},
        { $set: { isActive: false } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to suspend user account: ${e}`);
      return { error: e };
    }
  }


  //retrieve all users
  static async getAllusers() {
    /**
    Todo: retrieve all users from the database using slow loading. Limit to first 20
    */
    try {
      // Return the 20 most recent users.
      const pipeline = [
        {
          $sort: { firstname: 1, lastname: 1 }
        },
        {
          $limit: 20
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //users.readConcern

      const aggregateResult = await users.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve users: ${e}`);
      return { error: e };
    }
  }

  //retrieve a specific user account
  static async getUser(email, pwd, sl) {
    /**
    Todo: retrieve a specific user account.
    */
    try {
      // Return the matching user account.
      const pipeline = [
        {
          $match: {email: email, pwd: pwd, sl: sl}
        },
        {
          $sort: { email: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //users.readConcern

      const aggregateResult = await users.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve users: ${e}`);
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


