/* mySeedScript.js */

let seeder;

export default class seederModel {
    static async injectDB(conn) {
        if (seeder) {
            return;
        }
        try {
            //_ns = await conn.db(process.env.NS);
            // eslint-disable-next-line require-atomic-updates
            seeder = await conn.db(process.env.NS).collection("countries");
            //const exec = await this.seedCountriesDB();

        } catch (e) {
            console.error(
                `Unable to establish collection handles in seederModel: ${e}`
            );
        }
    }

    /// get list of countries and states from an external api
    static async getCountriesFromExternalAPI() {
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch countries:', error);
            return { error: 'Failed to fetch countries' };
        }
    }

    static async seedCountriesDB() {
        const response = await this.getCountriesFromExternalAPI();
        if (response.error) {
            console.log('Error fetching countries:', response.error);
            return;
        }
        try {
            //const countries = await conn.db(process.env.NS).collection("countries");
            console.log(seeder);
            //if(seeder.collection)

            const c = [];
            response.data.forEach((cAPI) => {
                let cData = {
                    country: cAPI.name,
                    code: cAPI.iso3,
                    states: cAPI.states
                }
                c.push(cData);
            });
            seeder.insertMany(c, {w: "majority"});
            console.log("Countries collection seeded! :)");
        } catch (e) {
            console.log(e.stack);
        }

    }

}