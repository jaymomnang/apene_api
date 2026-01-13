/*global process*/
let home;

export default class settingModel {
  static async injectDB(conn) {
    if (home) {
      return;
    }
    try {
      // eslint-disable-next-line require-atomic-updates
      home = await conn.db(process.env.NS).collection("countries");
    } catch (e) {
      console.error(`Unable to establish collection handles in homeModel: ${e}`);
    }
  }


  //execute a database handshake and confirm connection
  static async executeHandshake() {    
    try {
      const pipeline = [{ $sort: { key: -1 } }, { $limit: 1 }];
      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await home.aggregate(pipeline, {readConcern});
      const m = await aggregateResult.toArray();
      const msg = await m.length === 1 ? "Welcome to Apene Business Suite API!" : "Apene Business Suite: Handshake failed!";      
      return await msg;
    } catch (e) {
      console.error(`Unable to retrieve settings: ${e}`);
      return { error: e };
    }
  }

  //retrieve all countries
  static async getAllCountries() {
    /**
    Todo: retrieve all countries from the database using slow loading
    */
    try {
      const pipeline = [{$sort: { country: 1 }}];
      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; 
      const aggregateResult = await home.aggregate(pipeline, {readConcern});
      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve countries: ${e}`);
      return { error: e };
    }
  }

  //retrieve the states of a particular country
  static async getStatesByCountry(country) {   
    try {
      const pipeline = [{$match: { country: country }}];
      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; 
      const aggregateResult = await home.aggregate(pipeline, {readConcern});
      let s = await aggregateResult.toArray();
      return await s[0].states;
    } catch (e) {
      console.error(`Unable to get states: ${e}`);
      return { error: e };
    }
  }

  //retrieve a country using the country name
  static async getCountrybyName(country) {   
    try {
      const pipeline = [{$match: { country: country }}];
      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; 
      const aggregateResult = await home.aggregate(pipeline, {readConcern});
      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to get country data: ${e}`);
      return { error: e };
    }
  }

  //retrieve a country using the country code
  static async getCountrybyCode(code) {   
    try {
      const pipeline = [{$match: { code: code }}];
      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await home.aggregate(pipeline, {readConcern});
      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to get country data: ${e}`);
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

