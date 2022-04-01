import { Collection, Document, Filter, FindOptions, MongoClient, ObjectId } from 'mongodb';
import { Service } from 'typedi';

const DB_USERNAME = 'ProjectAdmin';
const DB_PASSWORD = 'sd2yRYUAl1f8de9j';

type MongoDocument = Document & { _id?: ObjectId | undefined };

@Service()
export class DatabaseService {
    private static dbUrl: string;
    private static dbName: string;
    private static dbCollection: string;
    collection: Collection;
    private isConnected: boolean;
    private mongoClient: MongoClient;

    constructor() {
        this.isConnected = false;
        DatabaseService.dbName = 'Projects';
        DatabaseService.dbCollection = 'Dictionary';
        DatabaseService.dbUrl = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.hxlnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    }

    async fetchDocuments(query: Filter<Document>, projection?: FindOptions<Document> | undefined): Promise<Document[]> {
        await this.connect();
        const documents = await this.collection.find(query, projection).toArray();
        return documents;
    }

    async addDocument(object: MongoDocument) {
        await this.connect();
        await this.collection.insertOne(object);
    }

    async removeDocument(parameters: Filter<Document>) {
        await this.connect();
        await this.collection.deleteOne(parameters);
    }

    async replaceDocument(parameters: Filter<Document>, document: Document) {
        await this.connect();
        await this.collection.replaceOne(parameters, document);
    }

    async resetDatabase() {
        await this.connect();
        await this.collection.deleteMany({});
    }

    async connect() {
        if (this.isConnected) return;
        try {
            this.mongoClient = new MongoClient(DatabaseService.dbUrl);
            await this.mongoClient.connect();
            this.collection = this.mongoClient.db(DatabaseService.dbName).collection(DatabaseService.dbCollection);
            this.isConnected = true;
        } catch (e) {
            // REASON : We need to know why the connection isn't establishing in case of unexpected error
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }
}
