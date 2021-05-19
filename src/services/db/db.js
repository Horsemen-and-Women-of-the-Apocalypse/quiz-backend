import { MongoClient } from "mongodb";
import config from "../../config/database";
import { ObjectID } from "mongodb";

const url = config.url;
const dbName = config.name;

const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: config.auth
});

class quizDB {
    /**
     * Connect to the database
     * To call once before using the database
     */
    async init() {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        this.db = client.db(dbName);
    }

    /**
    * Get all documents from a collection
    *
    * @param collection String, collection to get the documents from, Required
    * @return {Promise<Array<object>}
    */
    async getAllDocumentsFromCollection(collection) {
        const collec = this.db.collection(collection);
        const cursor = collec.find();

        let result = [];
        await cursor.forEach(q => result.push(q));
        return result;
    }

    /**
    * Drop collection
    *
    * @param collection String, collection to drop, Required
    */
    async dropCollection(collection) {
        let collectionsCursor = await this.db.listCollections({}, { nameOnly: true });
        let collections = await collectionsCursor.toArray();
        let collectionNames = collections.map(c => c.name);

        if (collectionNames.indexOf(collection) >= 0) await this.db.dropCollection(collection);
    }

    /**
    * Insert a document in a collection
    *
    * @param document object to add Required
    * @param collection String, collection to add the documents, Required
    *
    * @return {Promise<string>} The inserted document new id
    */
    async addDocument(document, collection) {
        const collec = this.db.collection(collection);
        const result = await collec.insertOne(document);
        return result.insertedId;
    }

    /**
    * Update a document in a collection
    *
    * @param {object} obj keys and values to change
    * @param {string} documentId Document ID to update
    * @param {string} collection collection of the document
    *
    * @return {Promise} The inserted document new id
    */
    async updateDocument(obj, documentId, collection) {
        var myquery = { _id: new ObjectID(documentId) };
        var newvalues = { $set: obj };
        await this.db.collection(collection).updateOne(myquery, newvalues);
    }
    /**
    * Push to an array to a document in a collection
    *
    * @param {string} arrayName array to push in
    * @param {object} value to add
    * @param {string} documentId Document ID to update
    * @param {string} collection collection of the document
    *
    * @return {Promise} The inserted document new id
    */
    async pushToDocument(arrayName, value, documentId, collection) {
        var myquery = { _id: new ObjectID(documentId) };
        let newV = {};
        newV[arrayName] = value;
        var newvalues = { $push: newV };
        await this.db.collection(collection).updateOne(myquery, newvalues);
    }

    /**
     * Close the database
     * @returns {Promise<void>}
     */
    close() {
        return client.close();
    }
}

export default quizDB;
