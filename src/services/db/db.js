import { MongoClient } from "mongodb";
import { config } from "../../config/database";

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
}

export default quizDB;
