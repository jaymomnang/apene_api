/*global process*/
import globalOps from "../misc/globalOps.js";

let products;
let _ns;

export default class productModel {
  static async injectDB(conn) {
    if (products) {
      return;
    }
    try {
      _ns = await conn.db(process.env.NS);
      // eslint-disable-next-line require-atomic-updates
      products = await conn.db(process.env.NS).collection("products");
    } catch (e) {
      console.error(
        `Unable to establish collection handles in productsModel: ${e}`
      );
    }
  }

  /**
   * Inserts a product into the `products` collection, with the following fields:
   * @param {string} productID - The _id of the product in the `products` collection.
   * @param {string} productName - The name of the Product.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Object} prices - The current price of the Product: costPrice, sellingPrice, bulkPrice, taxRate, currency
   * @param {Number} moq - The minimum order quantity for the Product.
   * @param {Number} qty - The available quantity of the Product.
   * @param {string} description - The description of the Product.
   * @param {string} productType - The type of the Product: Physical, Digital or Service.
   * @param {string} productCategory - The category of the Product.
   * @param {Object} locations - Warehouse locations of the product.
   * @param {Object} mdata - The metadata of the product. ImageURL, tags, notes.
   * @param {Object} lastPurchased - The last purchase info: date, supplier, costPrice, qty.
   * @param {Object} lastSold - The last sold info: date, customer, sellingPrice, qty.
   * @param {Number} reorderLevel - The reorder level of the product.
   * @param {String} status - The status of the product: active, inactive, discontinued.
   * @param {String} sku - The SKU of the product.
   * @param {String} barcode - The barcode of the product.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async addProduct(
    productID,
    productName,
    user,
    prices,
    moq,
    qty,
    description,
    productType,
    productCategory,
    locations,
    mdata,
    lastPurchased,
    lastSold,
    reorderLevel,
    status,
    sku,
    barcode
  ) {
    try {
      // TODO: Create/Update products
      // Construct the product record to be inserted.
      let date_upd = globalOps.currentDateTime();

      const productDoc = {
        productID: productID,
        productName: productName,
        user: user,
        prices: prices,
        moq: moq,
        qty: qty,
        description: description,
        productType: productType,
        productCategory: productCategory,
        locations: locations,
        mdata: mdata,
        lastPurchased: lastPurchased,
        lastSold: lastSold,
        reorderLevel: reorderLevel,
        status: status,
        sku: sku,
        barcode: barcode,
        dateCreated: date_upd,
        createdBy: user,
        dateUpdated: date_upd,
        updateBy: user,
        status: "active"
      };

      return await products.insertOne(productDoc, { w: "majority" });
    } catch (e) {
      console.error(`Unable to post product: ${e}`);
      return { error: e };
    }
  }

  /**
   * Updates a product into the `products` collection, with the following fields:
   * @param {string} productID - The _id of the product in the `products` collection.
   * @param {string} productName - The name of the Product.
   * @param {Object} user - An object containing the user's name and email.
   * @param {Object} prices - The current price of the Product: costPrice, sellingPrice, bulkPrice, taxRate, currency
   * @param {Number} moq - The minimum order quantity for the Product.
   * @param {Number} qty - The available quantity of the Product.
   * @param {string} description - The description of the Product.
   * @param {string} productType - The type of the Product: Physical, Digital or Service.
   * @param {string} productCategory - The category of the Product.
   * @param {Object} locations - Warehouse locations of the product.
   * @param {Object} mdata - The metadata of the product. ImageURL, tags, notes.
   * @param {Object} lastPurchased - The last purchase info: date, supplier, costPrice, qty.
   * @param {Object} lastSold - The last sold info: date, customer, sellingPrice, qty.
   * @param {Number} reorderLevel - The reorder level of the product.
   * @param {String} status - The status of the product: active, inactive, discontinued.
   * @param {String} sku - The SKU of the product.
   * @param {String} barcode - The barcode of the product.
   * @returns {DAOResponse} Returns an object with either DB response or "error"
   */
  static async updateProduct(
    productID,
    productName,
    user,
    prices,
    moq,
    qty,
    description,
    productType,
    productCategory,
    locations,
    mdata,
    lastPurchased,
    lastSold,
    reorderLevel,
    status,
    sku,
    barcode
  ) {
    try {
      // TODO: Create/Update products
      // Use the productID and status to select the proper Product, then update.

      let date_upd = globalOps.currentDateTime();

      const updateResponse = await products.updateOne(
        { productID: productID, status: "active" },
        {
          $set: {
            productName: productName,
            prices: prices,
            moq: moq,
            qty: qty,
            description: description,
            productType: productType,
            productCategory: productCategory,
            locations: locations,
            mdata: mdata,
            lastPurchased: lastPurchased,
            lastSold: lastSold,
            reorderLevel: reorderLevel,
            status: status,
            sku: sku,
            barcode: barcode,           
            dateUpdated: date_upd,
            updateBy: user,
            status: status
          }
        }
      );

      return updateResponse;
    } catch (e) {
      console.error(`Unable to update product: ${e}`);
      return { error: e };
    }
  }

  //void a specific product
  static async deleteProduct(productID) {
    /**
    Ticket: Discontinue a product. Only active products can be discontinued.
    */

    try {
      // TODO Ticket: discontinue product
      const deleteResponse = await products.updateOne(
        { productID: productID, status: "active" },
        { $set: { status: "discontinued" } }
      );

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to discontinue product: ${e}`);
      return { error: e };
    }
  }


  //retrieve all products
  static async getAllProducts() {
    /**
    Todo: retrieve all products from the database using slow loading.
    */
    try {
      const pipeline = [
        {
          $sort: { productID: -1 }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority";
      const aggregateResult = await products.aggregate(pipeline, { readConcern });
      return await aggregateResult.toArray();

    } catch (e) {
      console.error(`Unable to retrieve products: ${e}`);
      return { error: e };
    }
  }

  //retrieve an product using the transaction Id
  static async getProductById(Id) {
    try {
      const pipeline = [
        {
          $match: { productID: Id }
        }
      ];

      // Use a more durable Read Concern here to make sure this data is not stale.
      const readConcern = "majority"; //products.readConcern
      const aggregateResult = await products.aggregate(pipeline, {
        readConcern
      });

      return await aggregateResult.toArray();
    } catch (e) {
      console.error(`Unable to retrieve product: ${e}`);
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
    const { poolSize, wtimeout } = products.s.db.serverConfig.s.options
    let response = {
      poolSize,
      wtimeout,
      authInfo,
    }
    return response
  }


  /**
     *
     * @param {Object} filters - The search parameter to use in the query. Comes
     * in the form of `{cast: { $in: [...castMembers]}}`
     * @param {number} page - The page of movies to retrieve.
     * @param {number} moviesPerPage - The number of movies to display per page.
     * @returns {FacetedSearchReturn} FacetedSearchReturn
     */
  static async facetedSearch({
    filters = null,
    page = 0,
    moviesPerPage = 20,
  } = {}) {
    if (!filters || !filters.dates) {
      throw new Error("Must specify dates to filter by.")
    }
    const matchStage = { $match: filters }
    const sortStage = { $sort: { "productID": -1 } }
    const countingPipeline = [matchStage, sortStage, { $count: "count" }]
    const skipStage = { $skip: moviesPerPage * page }
    const limitStage = { $limit: moviesPerPage }
    const facetStage = {
      $facet: {
        customer: [
          {
            $bucket: {
              groupBy: "$productType",
              boundaries: [0, 50, 70, 90, 100],
              default: "other",
              output: {
                count: { $sum: 1 },
              },
            },
          },
        ]
      },
    }

    /**
    Ticket: Faceted Search

    Please append the skipStage, limitStage, and facetStage to the queryPipeline
    (in that order). You can accomplish this by adding the stages directly to
    the queryPipeline.

    The queryPipeline is a Javascript array, so you can use push() or concat()
    to complete this task, but you might have to do something about `const`.
    */

    const queryPipeline = [
      matchStage,
      sortStage,
      // TODO Ticket: Faceted Search
      // Add the stages to queryPipeline in the correct order.
      skipStage,
      limitStage,
      facetStage
    ]

    try {
      const results = await (await products.aggregate(queryPipeline)).next()
      const count = await (await products.aggregate(countingPipeline)).next()
      return {
        ...results,
        ...count,
      }
    } catch (e) {
      return { error: "Results too large, be more restrictive in filter" }
    }

  }
}

/**
 * Success/Error return object
 * @typedef DAOResponse
 * @property {boolean} [success] - Success
 * @property {string} [error] - Error
 */