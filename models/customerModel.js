/*global process*/

let customers;

export default class customersModel {
  static async injectDB(conn) {
    if (customers) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      customers = await conn.db(process.env.NS).collection("customers");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in customers: ${e}`
      );
    }
  }

  /**
  * Inserts a new customer data into the `customers` collection, with the following fields:
  * @param {string} customerID - The _id of the customer in the `customers` collection.
  * @param {string} fullname - The fullname of the customer.
  * @param {string} email - The email of the customer. 
  * @param {string} phoneno1 - The phone number of the customer.
  * @param {string} phoneno2 - The alternate phone number of the customer.
  * @param {string} customerType - The type of the customer.
  * @param {string} address - The address of the customer.
  * @param {string} city - The city of the customer.
  * @param {string} state - The state of the customer. 
  * @param {string} country - The country of the customer. 
  * @param {string} postcode - The postcode of the customer. 
  * @param {string} refSource - The reference source of the customer. 
  * @param {String} status - A switch to turn on/off the customer account.
  * @param {string} dateUpdated - The date on which the customer data was last updated.
  * @param {Object} updateBy - The user that last updated the customer data.
  * @param {string} dateCreated - The date the customer data was created.
  * @param {Object} createdBy - The user that created the customer.
  * @returns {DAOResponse} Returns an object with either DB response or "error"
  */
  static async addCustomer(
    customerID,
    fullname,
    email,
    phoneno1,
    phoneno2,
    customerType,
    address,
    city,
    state,
    country,
    postcode,
    refSource,
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
        customerID: customerID,
        fullname: fullname,
        email: email,
        phoneno1: phoneno1,
        phoneno2: phoneno2,
        customerType: customerType,
        address: address,
        city: city,
        state: state,
        country: country,
        postcode: postcode,
        refSource: refSource,       
        status: status,
        dateUpdated: dateUpdated,
        updateBy: updateBy,
        dateCreated: dateCreated,
        createdBy: createdBy
      };

      return await customers.insertOne(settingDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to save customer information: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates the customers in the customers collection.
   * @param {string} customerID - The _id of the customer in the `customers` collection.
   * @param {string} email - The email of the customer.
   * @param {string} phoneno1 - The phone number of the customer.
   * @param {string} phoneno2 - The alternate phone number of the customer.
   * @param {string} customerType - The type of the customer.
   * @param {string} address - The address of the customer.
   * @param {string} city - The city of the customer.
   * @param {string} state - The state of the customer. 
   * @param {string} country - The country of the customer. 
   * @param {string} postcode - The postcode of the customer. 
   * @param {string} refSource - The reference source of the customer. 
   * @param {String} status - A switch to turn on/off the customer account.
   * @param {string} dateUpdated - The date on which the customer data was last updated.
   * @param {Object} updateBy - The user that last updated the customer data.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateCustomer(
    customerID,
    email,
    phoneno1,
    phoneno2,
    customerType,
    address,
    city,
    state,
    country,
    postcode,
    refSource,
    status,
    dateUpdated,
    updateBy
  ) {
    try {
      // TODO: Create/Update customers
      // Use the customerID and email to select the proper customer, then update.

      const updateResponse = await customers.updateOne(
        { customerID: customerID, email: email },
        {
          $set: {
            phoneno1: phoneno1,
            phoneno2: phoneno2,
            customerType: customerType,
            address: address,
            city: city,
            state: state,
            country: country,
            postcode: postcode,
            refSource: refSource,                  
            status: status,
            dateUpdated: dateUpdated,
            updateBy: updateBy
          }
        }
      );
      return updateResponse;
    } catch (e) {
      console.error(`Unable to update customer information: ${e}`);
      return { error: e };
    }
  }

  //deactivate a specific customer
  static async deleteCustomer(customerID, status, user, dateUpdated) {
    /**
    Ticket: deactivate customer. Only active customers can be deactivated.
    */

    try {
      // TODO Ticket: deactivate setting
      const deleteResponse = await customers.updateOne(
        { key: customerID },
        { $set: { status: status, dateUpdated: dateUpdated, updateBy: user } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to activate/deactivate customer account: ${e}`);
      return { error: e };
    }
  }


  //retrieve all customers
  static async getAllCustomers() {
    /**
    Todo: retrieve all customers from the database using slow loading. Limit to first 20
    */
    try {
      const pipeline = [
        {
          $sort: { customerID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //customers.readConcern

      const aggregateResult = await customers.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve customers: ${e}`);
      return { error: e };
    }
  }

  //retrieve an customer using the customerID
  static async getCustomerById(Id) {   
    try {
      const pipeline = [
        {
          $match: { customerID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //customers.readConcern
      const aggregateResult = await customers.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to get customer information: ${e}`);
      return { error: e };
    }
  }

  //retrieve an customer using the email
  static async getCustomerByEmail(email) {   
    try {
      const pipeline = [
        {
          $match: { email: email }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //customers.readConcern
      const aggregateResult = await customers.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to get customer information: ${e}`);
      return { error: e };
    }
  }

  // get the last customer information
  static async getLastCustomer() {
    try {
      const lastCustomer = await customers.find().sort({ customerID: -1 }).limit(1).toArray();
      return lastCustomer[0] || null;
    } catch (e) {
      console.error(`Unable to get last customer information: ${e}`);
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

