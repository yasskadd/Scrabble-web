import { Collection, Document, Filter, MongoClient, ObjectId } from 'mongodb';
import { Service } from 'typedi';

const DB_USERNAME = 'ProjectAdmin';
const DB_PASSWORD = 'sd2yRYUAl1f8de9j';
const DB_URL = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.hxlnx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const DB_DB = 'Projects';
const DB_COLLECTION = 'Scrabble';

type MongoDocument = Document & { _id?: ObjectId | undefined };

@Service()
export class DatabaseService {
    collection: Collection;
    private isConnected: boolean;
    private mongoClient: MongoClient;

    constructor() {
        this.isConnected = false;
    }

    async addDocument(object: MongoDocument) {
        this.connect().then(() => {
            this.collection.insertOne(object);
        });
    }
    async removeDocument(parameters: Filter<Document>) {
        this.connect().then(() => {
            this.collection.deleteOne(parameters);
        });
    }
    async resetDatabase() {
        this.connect().then(() => {
            this.collection.deleteMany({});
        });
    }

    private async connect() {
        if (this.isConnected) return;
        try {
            this.mongoClient = new MongoClient(DB_URL);
            await this.mongoClient.connect();
            this.collection = this.mongoClient.db(DB_DB).collection(DB_COLLECTION);
            this.isConnected = true;
        } catch (e) {
            // REASON : We need to know why the connection isn't establishing in case of unexpected error
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }
}
