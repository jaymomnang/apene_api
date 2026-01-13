/*global process*/
import globalOps from "../misc/globalOps.js";

let settings;

export default class settingModel {
  static async injectDB(conn) {
    if (settings) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      settings = await conn.db(process.env.NS).collection("settings");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in settingModel: ${e}`
      );
    }
  }

  /**
  * Inserts an setting into the `settings` collection, with the following fields:
  * @param {string} key - The _id of the setting in the `settings` collection.
  * @param {string} name - The name of the settings.
  * @param {string} value - The value of the setting. 
  * @param {string} valueDescription - The long description of the settings.
  * @param {Boolean} isValueRange - Check if the setting has a range of values.
  * @param {string} startingRange - The starting value range of the setting. 
  * @param {string} endingRange - The ending value range of the setting. 
  * @param {String} status - A switch to turn on/off the setting.
  * @param {string} dateUpdated - The date the setting was last updated.
  * @param {Object} updatedBy - The user that last updated the setting.
  * @param {string} dateCreated - The date the setting was created.
  * @param {Object} createdBy - The user that created the setting.
  * @returns {DAOResponse} Returns an object with either DB response or "error"
  */
  static async addSetting(
    key,
    name,    
    value,
    valueDescription,
    isValueRange,
    startingRange,
    endingRange,
    status,
    dateUpdated,
    updateBy,
    dateCreated,
    createdBy
  ) {
    try {
      // TODO: Create/Update settings
      // Construct the setting document to be inserted.
      const settingDoc = {
        key: key,
        name: name,
        valueDescription: valueDescription,
        value: value,
        isValueRange: isValueRange,
        startingRange: startingRange,
        endingRange: endingRange,
        status: status,
        dateUpdated: dateUpdated,
        updateBy: updateBy,
        dateCreated: dateCreated,
        createdBy: createdBy
      };

      return await settings.insertOne(settingDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to save setting: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the setting in the setting collection.
   * @param {string} key - The _id of the setting in the `settings` collection.
   * @param {string} name - The name of the settings.
   * @param {string} value - The value of the setting. 
   * @param {string} valueDescription - The long description of the settings.
   * @param {Boolean} isValueRange - Check if the setting has a range of values.
   * @param {string} startingRange - The starting value range of the setting. 
   * @param {string} endingRange - The ending value range of the setting. 
   * @param {String} status - A switch to turn on/off the setting.
   * @param {string} dateUpdated - The date on which the setting was last updated.
   * @param {Object} updateBy - The user that last updated the setting.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateSetting(
    key,
    name,
    value,
    valueDescription,
    isValueRange,
    startingRange,
    endingRange,
    status,
    dateUpdated,
    updateBy
  ) {
    try {
      // TODO: Create/Update settings
      // Use the settingId and status to select the proper setting, then update.

      const updateResponse = await settings.updateOne(
        { key: key },
        {
          $set: {
            valueDescription: valueDescription,
            value: value,
            isValueRange: isValueRange,
            startingRange: startingRange,
            endingRange: endingRange,
            name: name,            
            status: status,
            dateUpdated: dateUpdated,
            updateBy: updateBy
          }
        }
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update setting: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific setting
  static async deleteSetting(key, status, user, dateUpdated) {
    /**
    Ticket: deactivate setting. Only active settings can be deactivated.
    */

    try {
      // TODO Ticket: deactivate setting
      const deleteResponse = await settings.updateOne(
        { key: key },
        { $set: { status: status, dateUpdated: dateUpdated, updateBy: user } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to activate/deactivate setting: ${e}`);
      return { error: e };
    }
  }


  //retrieve all settings
  static async getAllSettings() {
    /**
    Todo: retrieve all settings from the database using slow loading. Limit to first 20
    */
    try {
      const pipeline = [
        {
          $sort: { key: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //settings.readConcern

      const aggregateResult = await settings.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve settings: ${e}`);
      return { error: e };
    }
  }

  //retrieve an setting using the key
  static async getSettingById(Id) {   
    try {
      const pipeline = [
        {
          $match: { key: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //settings.readConcern
      const aggregateResult = await settings.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to get setting: ${e}`);
      return { error: e };
    }
  }

  //retrieve an setting using the name
  static async getSettingByName(name) {   
    try {
      const pipeline = [
        {
          $match: { name: name }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //settings.readConcern
      const aggregateResult = await settings.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to get setting: ${e}`);
      return { error: e };
    }
  }

  // get the last setting by key
  static async getLastSetting() {
    try {
      const lastSetting = await settings.find().sort({ key: -1 }).limit(1).toArray();
      return lastSetting[0] || null;
    } catch (e) {
      console.error(`Unable to get last setting: ${e}`);
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

