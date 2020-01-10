/*global process*/
import globalOps from "../misc/globalOps";

let projects;

export default class projectModel {
  static async injectDB(conn) {
    if (projects) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      projects = await conn.db(process.env.NS).collection("projects");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in projectModel: ${e}`
      );
    }
  }

  /**
   * Inserts a project into the `project` collection, with the following fields:

   * @param {string} projectID - The project ID.
   * @param {string} bank - The bank for which the transactions occured.
   * @param {string} startDate - The start date of the transaction.
   * @param {Number} totalAmount - The total amount of the project.
   * @param {string} description - Description of the project.
   * @param {Object} details - the detailed transactions of the project.
   * @param {string} status - the project status.
   * @param {Boolean} isActive - Switch to turn on/off an project.
   * @param {Object} user - the user that created/updated the project.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addproject(
    projectID,
    bank,
    startDate,
    totalAmount,
    details,
    description,
    isActive,
    user
  ) {
    try {
      let dateOps = globalOps.currentDateTime();

      // TODO: Create/Update projects
      // Construct the project document to be inserted.
      const projectDoc = {
        projectID: projectID,
        bank: bank,
        startDate: startDate,
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

      return await projects.insertOne(projectDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post to projects: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the project in the project collection.
   * @param {string} projectID - The project ID.
   * @param {Number} totalAmount - The total amount of the project.
   * @param {string} description - Description of the project.
   * @param {Object} details - the detailed transactions of the project.
   * @param {string} status - the project status.
   * @param {Boolean} isActive - Switch to turn on/off an project.
   * @param {Object} user - the user that created/updated the project.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateproject(projectID, totalAmount, details, description, isActive, status, user) {
    try {
      // TODO: Create/Update projects
      // Use the projectID to select the proper project, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await projects.updateOne(
        { projectID: projectID },
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
      console.error(`Unable to update projects: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific project
  static async deleteproject(projectID) {
    /**
    Ticket: deactivate project. Only active projects can be voided.
    */

    try {
      // TODO Ticket: deactivate project
      const deleteResponse = await projects.updateOne(
        { projectID: projectID, isActive: true, status: "OPEN" },
        { $set: { isActive: false, status: "VOIDED" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to deactivate the specified project: ${e}`);
      return { error: e };
    }
  }

  //retrieve projects
  static async getAllprojects() {
    /**
    Todo: retrieve projects from the database using slow loading. Limit to first 20
    */
    try {
      // Return the 20 most recent projects.
      const pipeline = [
        {
          $sort: { projectID: -1, startDate: -1 }
        },
        {
          $limit: 20
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //projects.readConcern

      const aggregateResult = await projects.aggregate(pipeline, {
        readConcern
      });
      
      return await aggregateResult.toArray();
      
    } catch (e) {
      console.error(`Unable to retrieve project: ${e}`);
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
